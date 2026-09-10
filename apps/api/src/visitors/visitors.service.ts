import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, VisitorFollowUpStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { MembersService } from '../members/members.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { ConvertVisitorDto } from './dto/convert-visitor.dto';

const visitorInclude = {
  assignedToUser: { select: { id: true, firstName: true, lastName: true } },
  followUps: {
    orderBy: { contactedAt: 'desc' as const },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  },
} as const;

export interface FindAllVisitorsParams {
  page: number;
  pageSize: number;
  search?: string;
  followUpStatus?: VisitorFollowUpStatus;
  assignedToUserId?: string;
}

@Injectable()
export class VisitorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membersService: MembersService,
  ) {}

  async findAll(params: FindAllVisitorsParams) {
    const { page, pageSize, search, followUpStatus, assignedToUserId } = params;

    const where: Prisma.VisitorWhereInput = {
      ...(followUpStatus ? { followUpStatus } : {}),
      ...(assignedToUserId ? { assignedToUserId } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.visitor.findMany({
        where,
        include: {
          assignedToUser: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { dateVisited: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.visitor.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const visitor = await this.prisma.visitor.findUnique({
      where: { id },
      include: visitorInclude,
    });
    if (!visitor) {
      throw new NotFoundException('Visitor not found');
    }
    return visitor;
  }

  create(dto: CreateVisitorDto) {
    return this.prisma.visitor.create({ data: dto, include: visitorInclude });
  }

  async update(id: string, dto: UpdateVisitorDto) {
    await this.findOne(id);
    return this.prisma.visitor.update({
      where: { id },
      data: dto,
      include: visitorInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.visitor.delete({ where: { id } });
    return { message: 'Visitor record deleted' };
  }

  async addFollowUp(visitorId: string, userId: string, dto: CreateFollowUpDto) {
    await this.findOne(visitorId);

    await this.prisma.$transaction([
      this.prisma.visitorFollowUp.create({
        data: { visitorId, userId, status: dto.status, notes: dto.notes },
      }),
      this.prisma.visitor.update({
        where: { id: visitorId },
        data: { followUpStatus: dto.status },
      }),
    ]);

    return this.findOne(visitorId);
  }

  async convertToMember(visitorId: string, dto: ConvertVisitorDto) {
    const visitor = await this.findOne(visitorId);

    if (visitor.convertedMemberId) {
      throw new BadRequestException(
        'This visitor has already been converted to a member',
      );
    }

    const member = await this.membersService.create({
      firstName: dto.firstName ?? visitor.firstName,
      lastName: dto.lastName ?? visitor.lastName,
      phone: dto.phone ?? visitor.phone ?? undefined,
      whatsappNumber: dto.whatsappNumber ?? visitor.whatsappNumber ?? undefined,
      email: dto.email ?? visitor.email ?? undefined,
      gender: dto.gender,
      residentialAddress:
        dto.residentialAddress ?? visitor.address ?? undefined,
      membershipStatusId: dto.membershipStatusId,
      memberCategoryId: dto.memberCategoryId,
      dateJoinedChurch: dto.dateJoinedChurch,
    });

    await this.prisma.visitor.update({
      where: { id: visitorId },
      data: {
        convertedMemberId: member.id,
        followUpStatus: VisitorFollowUpStatus.JOINED,
      },
    });

    return this.findOne(visitorId);
  }
}
