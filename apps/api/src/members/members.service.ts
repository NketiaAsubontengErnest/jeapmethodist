import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

export interface FindAllMembersParams {
  page: number;
  pageSize: number;
  search?: string;
  membershipStatusId?: string;
  memberCategoryId?: string;
  isActive?: boolean;
}

const memberInclude = {
  membershipStatus: true,
  memberCategory: true,
  groupMemberships: {
    include: {
      group: true,
    },
  },
  ministryMemberships: {
    include: {
      ministry: true,
    },
  },
} as const;

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateMembershipNumber(): Promise<string> {
    const count = await this.prisma.member.count();
    return `MEM-${String(count + 1).padStart(5, '0')}`;
  }

  async findAll(params: FindAllMembersParams) {
    const {
      page,
      pageSize,
      search,
      membershipStatusId,
      memberCategoryId,
      isActive,
    } = params;

    const where: Prisma.MemberWhereInput = {
      ...(membershipStatusId ? { membershipStatusId } : {}),
      ...(memberCategoryId ? { memberCategoryId } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { membershipNumber: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        include: memberInclude,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Members with a birthday in the next 7 days (rolling window, useful for
   * "who do we shout out this week") and members with a birthday anywhere in
   * the current calendar month. Computed in JS rather than SQL — matching
   * "month/day regardless of year" cleanly across a year boundary (e.g. a
   * Dec 29 birthday should show up in a week window that starts Dec 28 and
   * crosses into January) is fiddly to express portably in a WHERE clause,
   * and a single church's member count makes an in-memory pass trivial.
   */
  async getUpcomingBirthdays() {
    const members = await this.prisma.member.findMany({
      where: { isActive: true, dateOfBirth: { not: null } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phone: true,
        profilePhotoUrl: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const nextBirthdayThisYear = (dob: Date) => {
      const next = new Date(currentYear, dob.getMonth(), dob.getDate());
      next.setHours(0, 0, 0, 0);
      if (next < today) {
        next.setFullYear(currentYear + 1);
      }
      return next;
    };

    const turningAge = (dob: Date, onDate: Date) => onDate.getFullYear() - dob.getFullYear();

    const withNextBirthday = members
      .filter((m) => m.dateOfBirth)
      .map((m) => {
        const dob = m.dateOfBirth as Date;
        const next = nextBirthdayThisYear(dob);
        const daysUntil = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { member: m, dob, next, daysUntil, turningAge: turningAge(dob, next) };
      });

    const thisWeek = withNextBirthday
      .filter((x) => x.daysUntil >= 0 && x.daysUntil <= 6)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .map((x) => ({
        id: x.member.id,
        firstName: x.member.firstName,
        lastName: x.member.lastName,
        phone: x.member.phone,
        profilePhotoUrl: x.member.profilePhotoUrl,
        birthday: x.next.toISOString().slice(0, 10),
        daysUntil: x.daysUntil,
        turningAge: x.turningAge,
      }));

    const thisMonth = withNextBirthday
      .filter((x) => x.dob.getMonth() === currentMonth)
      .sort((a, b) => a.dob.getDate() - b.dob.getDate())
      .map((x) => ({
        id: x.member.id,
        firstName: x.member.firstName,
        lastName: x.member.lastName,
        phone: x.member.phone,
        profilePhotoUrl: x.member.profilePhotoUrl,
        birthday: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(x.dob.getDate()).padStart(2, '0')}`,
        day: x.dob.getDate(),
        turningAge: currentYear - x.dob.getFullYear(),
        isPast: x.dob.getDate() < today.getDate(),
      }));

    return { thisWeek, thisMonth };
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        ...memberInclude,
        familyMemberships: {
          include: {
            family: {
              include: {
                members: {
                  include: {
                    member: {
                      select: { id: true, firstName: true, lastName: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }

  async create(dto: CreateMemberDto) {
    const { groupIds, ministryIds, ...memberData } = dto;
    const membershipNumber =
      memberData.membershipNumber ?? (await this.generateMembershipNumber());

    const existing = await this.prisma.member.findUnique({
      where: { membershipNumber },
    });
    if (existing) {
      throw new ConflictException(
        'A member with this membership number already exists',
      );
    }

    return this.prisma.member.create({
      data: {
        ...memberData,
        membershipNumber,
        ...(groupIds && groupIds.length > 0
          ? {
              groupMemberships: {
                create: groupIds.map((groupId) => ({ groupId })),
              },
            }
          : {}),
        ...(ministryIds && ministryIds.length > 0
          ? {
              ministryMemberships: {
                create: ministryIds.map((ministryId) => ({ ministryId })),
              },
            }
          : {}),
      },
      include: memberInclude,
    });
  }

  async update(id: string, dto: UpdateMemberDto) {
    await this.findOne(id);
    const { groupIds, ministryIds, ...memberData } = dto;

    if (memberData.membershipNumber) {
      const existing = await this.prisma.member.findUnique({
        where: { membershipNumber: memberData.membershipNumber },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'A member with this membership number already exists',
        );
      }
    }

    if (groupIds !== undefined) {
      await this.prisma.groupMember.deleteMany({
        where: {
          memberId: id,
          groupId: { notIn: groupIds },
        },
      });
      for (const groupId of groupIds) {
        await this.prisma.groupMember.upsert({
          where: {
            groupId_memberId: { groupId, memberId: id },
          },
          create: { groupId, memberId: id },
          update: {},
        });
      }
    }

    if (ministryIds !== undefined) {
      await this.prisma.ministryMember.deleteMany({
        where: {
          memberId: id,
          ministryId: { notIn: ministryIds },
        },
      });
      for (const ministryId of ministryIds) {
        await this.prisma.ministryMember.upsert({
          where: {
            ministryId_memberId: { ministryId, memberId: id },
          },
          create: { ministryId, memberId: id },
          update: {},
        });
      }
    }

    return this.prisma.member.update({
      where: { id },
      data: memberData,
      include: memberInclude,
    });
  }

  /** Soft-delete: future attendance/giving/ministry records will reference members by id. */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.member.update({
      where: { id },
      data: { isActive: false },
      include: memberInclude,
    });
  }
}
