import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const roleInclude = { permissions: { include: { permission: true } } } as const;

function toRoleResponse(role: {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissions: { permission: { code: string; module: string } }[];
}) {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    isActive: role.isActive,
    permissions: role.permissions.map((rp) => rp.permission.code),
  };
}

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: roleInclude,
      orderBy: { name: 'asc' },
    });
    return roles.map(toRoleResponse);
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: roleInclude,
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return toRoleResponse(role);
  }

  async listPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });
  }

  private async resolvePermissionIds(codes: string[]) {
    if (codes.length === 0) return [];
    const permissions = await this.prisma.permission.findMany({
      where: { code: { in: codes } },
    });
    if (permissions.length !== codes.length) {
      const found = new Set(permissions.map((p) => p.code));
      const missing = codes.filter((c) => !found.has(c));
      throw new BadRequestException(
        `Unknown permission code(s): ${missing.join(', ')}`,
      );
    }
    return permissions.map((p) => p.id);
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('A role with this name already exists');
    }

    const permissionIds = await this.resolvePermissionIds(dto.permissionCodes);

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: {
          create: permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
      include: roleInclude,
    });

    return toRoleResponse(role);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (dto.permissionCodes) {
      const permissionIds = await this.resolvePermissionIds(
        dto.permissionCodes,
      );
      await this.prisma.$transaction([
        this.prisma.rolePermission.deleteMany({ where: { roleId: id } }),
        this.prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        }),
      ]);
    }

    const updated = await this.prisma.role.update({
      where: { id },
      data: { name: dto.name, description: dto.description },
      include: roleInclude,
    });

    return toRoleResponse(updated);
  }

  async remove(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (role.isSystem) {
      throw new BadRequestException(
        'System roles cannot be deleted, only edited',
      );
    }
    await this.prisma.role.delete({ where: { id } });
    return { message: 'Role deleted' };
  }
}
