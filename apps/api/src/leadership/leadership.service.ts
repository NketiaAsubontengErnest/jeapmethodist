import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { CreateLeadershipDto } from './dto/create-leadership.dto';
import { UpdateLeadershipDto } from './dto/update-leadership.dto';

@Injectable()
export class LeadershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // Positions
  findAllPositions() {
    return this.prisma.churchPosition.findMany({
      orderBy: [{ displayOrder: 'asc' }, { title: 'asc' }],
    });
  }

  async createPosition(dto: CreatePositionDto, actorUserId?: string) {
    const existing = await this.prisma.churchPosition.findUnique({
      where: { title: dto.title },
    });
    if (existing) {
      throw new ConflictException(
        'A leadership position with this title already exists',
      );
    }

    const position = await this.prisma.churchPosition.create({ data: dto });

    await this.auditService.record({
      userId: actorUserId,
      action: 'leadership.position_create',
      module: 'leadership',
      entityType: 'ChurchPosition',
      entityId: position.id,
      newValue: { title: position.title },
    });

    return position;
  }

  async findOnePosition(id: string) {
    const position = await this.prisma.churchPosition.findUnique({
      where: { id },
    });
    if (!position) {
      throw new NotFoundException('Leadership position not found');
    }
    return position;
  }

  async updatePosition(
    id: string,
    dto: UpdatePositionDto,
    actorUserId?: string,
  ) {
    await this.findOnePosition(id);
    const position = await this.prisma.churchPosition.update({
      where: { id },
      data: dto,
    });

    await this.auditService.record({
      userId: actorUserId,
      action: 'leadership.position_update',
      module: 'leadership',
      entityType: 'ChurchPosition',
      entityId: id,
      newValue: { title: position.title },
    });

    return position;
  }

  async removePosition(id: string, actorUserId?: string) {
    await this.findOnePosition(id);
    const inUse = await this.prisma.churchLeadership.count({
      where: { positionId: id },
    });
    if (inUse > 0) {
      throw new BadRequestException(
        `Cannot delete: ${inUse} leadership profile(s) use this position. Deactivate it instead.`,
      );
    }
    await this.prisma.churchPosition.delete({ where: { id } });

    await this.auditService.record({
      userId: actorUserId,
      action: 'leadership.position_delete',
      module: 'leadership',
      entityType: 'ChurchPosition',
      entityId: id,
    });

    return { message: 'Leadership position deleted' };
  }

  findPublicLeadership() {
    return this.prisma.churchLeadership.findMany({
      where: { isActive: true, position: { isActive: true } },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        bio: true,
        phone: true,
        email: true,
        displayOrder: true,
        position: {
          select: { title: true, category: true, displayOrder: true },
        },
        member: {
          select: { firstName: true, lastName: true, profilePhotoUrl: true },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { position: { displayOrder: 'asc' } }],
    });
  }

  // Leadership Profiles
  findAllLeadership() {
    return this.prisma.churchLeadership.findMany({
      include: {
        position: true,
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            membershipNumber: true,
            phone: true,
            email: true,
            profilePhotoUrl: true,
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { position: { displayOrder: 'asc' } }],
    });
  }

  async findOneLeadership(id: string) {
    const record = await this.prisma.churchLeadership.findUnique({
      where: { id },
      include: {
        position: true,
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            membershipNumber: true,
            phone: true,
            email: true,
            profilePhotoUrl: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Leadership profile not found');
    }

    return record;
  }

  async createLeadership(dto: CreateLeadershipDto, actorUserId?: string) {
    const position = await this.prisma.churchPosition.findUnique({
      where: { id: dto.positionId },
    });
    if (!position) {
      throw new NotFoundException('Leadership position not found');
    }

    let memberName = dto.name;
    let memberPhone = dto.phone;
    let memberEmail = dto.email;
    let memberPhoto = dto.photoUrl;

    if (dto.memberId) {
      const member = await this.prisma.member.findUnique({
        where: { id: dto.memberId },
      });
      if (!member) {
        throw new NotFoundException('Associated member record not found');
      }
      memberName = memberName || `${member.firstName} ${member.lastName}`;
      memberPhone = memberPhone || member.phone || undefined;
      memberEmail = memberEmail || member.email || undefined;
      memberPhoto = memberPhoto || member.profilePhotoUrl || undefined;
    }

    const record = await this.prisma.churchLeadership.create({
      data: {
        ...dto,
        name: memberName,
        phone: memberPhone,
        email: memberEmail,
        photoUrl: memberPhoto,
      },
      include: {
        position: true,
        member: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await this.auditService.record({
      userId: actorUserId,
      action: 'leadership.create',
      module: 'leadership',
      entityType: 'ChurchLeadership',
      entityId: record.id,
      newValue: { positionTitle: position.title, name: record.name },
    });

    return record;
  }

  async updateLeadership(
    id: string,
    dto: UpdateLeadershipDto,
    actorUserId?: string,
  ) {
    const existing = await this.findOneLeadership(id);

    const updated = await this.prisma.churchLeadership.update({
      where: { id },
      data: dto,
      include: {
        position: true,
        member: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await this.auditService.record({
      userId: actorUserId,
      action: 'leadership.update',
      module: 'leadership',
      entityType: 'ChurchLeadership',
      entityId: id,
      previousValue: { name: existing.name, isActive: existing.isActive },
      newValue: { name: updated.name, isActive: updated.isActive },
    });

    return updated;
  }

  async removeLeadership(id: string, actorUserId?: string) {
    const record = await this.findOneLeadership(id);
    await this.prisma.churchLeadership.delete({ where: { id } });

    await this.auditService.record({
      userId: actorUserId,
      action: 'leadership.delete',
      module: 'leadership',
      entityType: 'ChurchLeadership',
      entityId: id,
      previousValue: { name: record.name },
    });

    return { message: 'Leadership record deleted successfully' };
  }
}
