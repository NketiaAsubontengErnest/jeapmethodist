import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddGroupMemberDto } from './dto/add-group-member.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  findAll() {
    return this.prisma.churchGroup.findMany({
      include: {
        leaderMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        assistantLeaderMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        _count: { select: { members: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.churchGroup.findUnique({
      where: { id },
      include: {
        leaderMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            membershipNumber: true,
          },
        },
        assistantLeaderMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            membershipNumber: true,
          },
        },
        members: {
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                membershipNumber: true,
                phone: true,
                email: true,
                gender: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Church group not found');
    }

    return group;
  }

  async create(dto: CreateGroupDto, actorUserId?: string) {
    const slug = slugify(dto.name);
    const existing = await this.prisma.churchGroup.findFirst({
      where: { OR: [{ name: dto.name }, { slug }] },
    });

    if (existing) {
      throw new ConflictException('A group with this name already exists');
    }

    const group = await this.prisma.churchGroup.create({
      data: {
        ...dto,
        slug,
      },
    });

    await this.auditService.record({
      userId: actorUserId,
      action: 'group.create',
      module: 'group',
      entityType: 'ChurchGroup',
      entityId: group.id,
      newValue: { name: group.name },
    });

    return group;
  }

  async update(id: string, dto: UpdateGroupDto, actorUserId?: string) {
    const existing = await this.findOne(id);

    let slug = existing.slug;
    if (dto.name && dto.name !== existing.name) {
      slug = slugify(dto.name);
      const duplicate = await this.prisma.churchGroup.findFirst({
        where: { OR: [{ name: dto.name }, { slug }], NOT: { id } },
      });
      if (duplicate) {
        throw new ConflictException('A group with this name already exists');
      }
    }

    const updated = await this.prisma.churchGroup.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.name ? { slug } : {}),
      },
    });

    await this.auditService.record({
      userId: actorUserId,
      action: 'group.update',
      module: 'group',
      entityType: 'ChurchGroup',
      entityId: id,
      previousValue: { name: existing.name, isActive: existing.isActive },
      newValue: { name: updated.name, isActive: updated.isActive },
    });

    return updated;
  }

  async remove(id: string, actorUserId?: string) {
    const group = await this.findOne(id);
    await this.prisma.churchGroup.delete({ where: { id } });

    await this.auditService.record({
      userId: actorUserId,
      action: 'group.delete',
      module: 'group',
      entityType: 'ChurchGroup',
      entityId: id,
      previousValue: { name: group.name },
    });

    return { message: 'Church group deleted successfully' };
  }

  async addMember(
    groupId: string,
    dto: AddGroupMemberDto,
    actorUserId?: string,
  ) {
    await this.findOne(groupId);

    const member = await this.prisma.member.findUnique({
      where: { id: dto.memberId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const existingRelation = await this.prisma.groupMember.findUnique({
      where: {
        groupId_memberId: {
          groupId,
          memberId: dto.memberId,
        },
      },
    });

    if (existingRelation) {
      throw new ConflictException('Member is already enrolled in this group');
    }

    const record = await this.prisma.groupMember.create({
      data: {
        groupId,
        memberId: dto.memberId,
        roleInGroup: dto.roleInGroup || 'Member',
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            membershipNumber: true,
          },
        },
      },
    });

    await this.auditService.record({
      userId: actorUserId,
      action: 'group.member_add',
      module: 'group',
      entityType: 'GroupMember',
      entityId: record.id,
      newValue: { groupId, memberId: dto.memberId },
    });

    return record;
  }

  async removeMember(groupId: string, memberId: string, actorUserId?: string) {
    const record = await this.prisma.groupMember.findUnique({
      where: {
        groupId_memberId: {
          groupId,
          memberId,
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Member is not in this group');
    }

    await this.prisma.groupMember.delete({
      where: { id: record.id },
    });

    await this.auditService.record({
      userId: actorUserId,
      action: 'group.member_remove',
      module: 'group',
      entityType: 'GroupMember',
      entityId: record.id,
      previousValue: { groupId, memberId },
    });

    return { message: 'Member removed from group' };
  }
}
