import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { slugify } from '../common/utils/slugify.util';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const eventInclude = {
  ministry: { select: { id: true, name: true } },
} as const;

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic() {
    return this.prisma.event.findMany({
      where: { isPublished: true },
      orderBy: { startDate: 'asc' },
      include: eventInclude,
    });
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: eventInclude,
    });
    if (!event || !event.isPublished) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async findAllAdmin(params: {
    page: number;
    pageSize: number;
    search?: string;
  }) {
    const { page, pageSize, search } = params;
    const where: Prisma.EventWhereInput = search
      ? { title: { contains: search, mode: 'insensitive' } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: eventInclude,
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneAdmin(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: eventInclude,
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  private async generateUniqueSlug(title: string, excludeId?: string) {
    const base = slugify(title);
    let slug = base;
    let suffix = 1;
    while (
      await this.prisma.event.findFirst({
        where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      })
    ) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
    return slug;
  }

  async create(dto: CreateEventDto) {
    const slug = await this.generateUniqueSlug(dto.title);
    return this.prisma.event.create({
      data: { ...dto, slug },
      include: eventInclude,
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    const existing = await this.findOneAdmin(id);
    const slug =
      dto.title && dto.title !== existing.title
        ? await this.generateUniqueSlug(dto.title, id)
        : undefined;

    try {
      return await this.prisma.event.update({
        where: { id },
        data: { ...dto, ...(slug ? { slug } : {}) },
        include: eventInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('An event with this title already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOneAdmin(id);
    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event deleted' };
  }
}
