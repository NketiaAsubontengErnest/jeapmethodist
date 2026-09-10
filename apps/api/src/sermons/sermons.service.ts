import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { slugify } from '../common/utils/slugify.util';
import { CreateSermonDto } from './dto/create-sermon.dto';
import { UpdateSermonDto } from './dto/update-sermon.dto';

@Injectable()
export class SermonsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic() {
    return this.prisma.sermon.findMany({
      where: { isPublished: true },
      orderBy: { date: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const sermon = await this.prisma.sermon.findUnique({ where: { slug } });
    if (!sermon || !sermon.isPublished) {
      throw new NotFoundException('Sermon not found');
    }
    return sermon;
  }

  async findAllAdmin(params: {
    page: number;
    pageSize: number;
    search?: string;
  }) {
    const { page, pageSize, search } = params;
    const where: Prisma.SermonWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { speaker: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.sermon.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.sermon.count({ where }),
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
    const sermon = await this.prisma.sermon.findUnique({ where: { id } });
    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }
    return sermon;
  }

  private async generateUniqueSlug(title: string, excludeId?: string) {
    const base = slugify(title);
    let slug = base;
    let suffix = 1;
    while (
      await this.prisma.sermon.findFirst({
        where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      })
    ) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
    return slug;
  }

  async create(dto: CreateSermonDto) {
    const slug = await this.generateUniqueSlug(dto.title);
    return this.prisma.sermon.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: UpdateSermonDto) {
    const existing = await this.findOneAdmin(id);
    const slug =
      dto.title && dto.title !== existing.title
        ? await this.generateUniqueSlug(dto.title, id)
        : undefined;

    try {
      return await this.prisma.sermon.update({
        where: { id },
        data: { ...dto, ...(slug ? { slug } : {}) },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A sermon with this title already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOneAdmin(id);
    await this.prisma.sermon.delete({ where: { id } });
    return { message: 'Sermon deleted' };
  }
}
