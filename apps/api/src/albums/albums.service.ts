import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class AlbumsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAlbumDto) {
    let slug = slugify(dto.title);
    const existing = await this.prisma.album.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    return this.prisma.album.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        coverUrl: dto.coverUrl,
      },
      include: {
        _count: { select: { photos: true } },
      },
    });
  }

  async findAll(params: { page?: number; pageSize?: number }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 25;

    const [items, total] = await Promise.all([
      this.prisma.album.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { photos: true } },
          photos: {
            take: 4,
            select: { id: true, url: true, title: true },
          },
        },
      }),
      this.prisma.album.count(),
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
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploadedBy: { select: { firstName: true, lastName: true } },
          },
        },
        _count: { select: { photos: true } },
      },
    });

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    return album;
  }

  async update(id: string, dto: UpdateAlbumDto) {
    await this.findOne(id);
    let slug: string | undefined;

    if (dto.title) {
      slug = slugify(dto.title);
      const existing = await this.prisma.album.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    return this.prisma.album.update({
      where: { id },
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        coverUrl: dto.coverUrl,
      },
      include: {
        _count: { select: { photos: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.album.delete({ where: { id } });
    return { message: 'Album deleted successfully' };
  }
}
