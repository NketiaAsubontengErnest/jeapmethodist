import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpsertProgrammeTypeDto } from './dto/upsert-programme-type.dto';
import { UpdateProgrammeTypeDto } from './dto/update-programme-type.dto';

@Injectable()
export class ProgrammeTypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.programmeType.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const type = await this.prisma.programmeType.findUnique({ where: { id } });
    if (!type) {
      throw new NotFoundException('Programme type not found');
    }
    return type;
  }

  async create(dto: UpsertProgrammeTypeDto) {
    const existing = await this.prisma.programmeType.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        'A programme type with this name already exists',
      );
    }
    return this.prisma.programmeType.create({ data: dto });
  }

  async update(id: string, dto: UpdateProgrammeTypeDto) {
    await this.findOne(id);
    return this.prisma.programmeType.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const inUse = await this.prisma.attendanceSession.count({
      where: { programmeTypeId: id },
    });
    if (inUse > 0) {
      throw new BadRequestException(
        `Cannot delete: ${inUse} attendance session(s) use this programme type. Deactivate it instead.`,
      );
    }
    await this.prisma.programmeType.delete({ where: { id } });
    return { message: 'Programme type deleted' };
  }
}
