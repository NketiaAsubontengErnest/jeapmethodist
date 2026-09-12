import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import { MediaType, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { MEDIA_UPLOAD_DIR } from './media.constants';
import { CreateVideoPostDto } from './dto/create-video-post.dto';
import { parseVideoUrl } from './media-utils';

@Injectable()
export class MediaService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.prisma.media.updateMany({
        where: {
          mimeType: 'video/embed',
          type: MediaType.PHOTO,
        },
        data: {
          type: MediaType.VIDEO,
        },
      });
    } catch {
      // Ignore initial boot errors
    }
  }

  create(params: {
    filename: string;
    storedName: string;
    mimeType: string;
    size: number;
    url?: string;
    category?: string;
    title?: string;
    description?: string;
    type?: MediaType;
    albumId?: string;
    uploadedById: string;
  }) {
    const publicOrigin = this.configService.get<string>('publicOrigin') ?? '';
    const finalUrl = params.url || `${publicOrigin}/uploads/media/${params.storedName}`;
    return this.prisma.media.create({
      data: {
        filename: params.filename,
        storedName: params.storedName,
        mimeType: params.mimeType,
        size: params.size,
        category: params.category,
        title: params.title,
        description: params.description,
        type: params.type || MediaType.PHOTO,
        albumId: params.albumId || null,
        uploadedById: params.uploadedById,
        url: finalUrl,
      },
      include: {
        album: { select: { id: true, title: true } },
        uploadedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async createVideoPost(dto: CreateVideoPostDto, uploadedById: string) {
    const embedDetails = parseVideoUrl(dto.videoUrlOrId);
    const videoType =
      dto.type === MediaType.LIVE_VIDEO ? MediaType.LIVE_VIDEO : MediaType.VIDEO;

    return this.prisma.media.create({
      data: {
        filename: dto.title,
        storedName: `embed_${randomUUID()}`,
        url: embedDetails.embedUrl,
        mimeType: 'video/embed',
        size: 0,
        type: videoType,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        externalUrl: dto.videoUrlOrId,
        platform: embedDetails.platform,
        embedId: embedDetails.embedId,
        uploadedById,
      },
      include: {
        uploadedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async findAllAdmin(params: {
    page: number;
    pageSize: number;
    category?: string;
    type?: MediaType;
    albumId?: string;
  }) {
    const { page, pageSize, category, type, albumId } = params;

    const typeFilter: Prisma.MediaWhereInput = type
      ? type === MediaType.VIDEO
        ? { OR: [{ type: MediaType.VIDEO }, { mimeType: 'video/embed' }] }
        : type === MediaType.LIVE_VIDEO
        ? { OR: [{ type: MediaType.LIVE_VIDEO }, { mimeType: 'video/embed' }] }
        : type === MediaType.PHOTO
        ? { type: MediaType.PHOTO, NOT: { mimeType: 'video/embed' } }
        : { type }
      : {};

    const where: Prisma.MediaWhereInput = {
      ...(category
        ? { category }
        : {
            OR: [{ category: null }, { category: { not: 'identity' } }],
          }),
      ...typeFilter,
      ...(albumId ? { albumId } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          album: { select: { id: true, title: true } },
          uploadedBy: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findPublicGallery(params: {
    type?: MediaType;
    albumId?: string;
    limit?: number;
  }) {
    const { type, albumId, limit = 50 } = params;

    const typeFilter: Prisma.MediaWhereInput = type
      ? type === MediaType.VIDEO
        ? { OR: [{ type: MediaType.VIDEO }, { mimeType: 'video/embed' }] }
        : type === MediaType.LIVE_VIDEO
        ? { OR: [{ type: MediaType.LIVE_VIDEO }, { mimeType: 'video/embed' }] }
        : type === MediaType.PHOTO
        ? { type: MediaType.PHOTO, NOT: { mimeType: 'video/embed' } }
        : { type }
      : {};

    const where: Prisma.MediaWhereInput = {
      ...typeFilter,
      ...(albumId ? { albumId } : {}),
      OR: [{ category: null }, { category: { not: 'identity' } }],
    };

    const [items, albums] = await Promise.all([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          album: { select: { id: true, title: true, slug: true } },
        },
      }),
      this.prisma.album.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          _count: { select: { photos: true } },
          photos: {
            // Plain `NOT: [{ category: 'identity' }, ...]` silently drops
            // every row with a NULL category/title too — SQL's NOT(x = y)
            // is NULL (neither true nor false) when x is NULL, and a WHERE
            // clause only keeps rows where the condition is true. Most
            // photos have no category/title set, so that excluded almost
            // everything. Same fix as findAllAdmin/findPublicGallery above.
            where: {
              AND: [
                { OR: [{ category: null }, { category: { not: 'identity' } }] },
                { OR: [{ title: null }, { title: { notIn: ['logo_url', 'favicon_url'] } }] },
              ],
            },
            take: 4,
            select: { id: true, url: true, title: true },
          },
        },
      }),
    ]);

    return { items, albums };
  }

  async update(id: string, data: { title?: string; description?: string; category?: string; albumId?: string }) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media item not found');
    }
    return this.prisma.media.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.albumId !== undefined ? { albumId: data.albumId || null } : {}),
      },
      include: {
        album: { select: { id: true, title: true } },
        uploadedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async remove(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media file not found');
    }
    await this.prisma.media.delete({ where: { id } });

    if (media.type === MediaType.PHOTO && media.storedName && !media.storedName.startsWith('embed_')) {
      try {
        await unlink(join(MEDIA_UPLOAD_DIR, media.storedName));
      } catch {
        // File missing on disk is ignored
      }
    }

    return { message: 'Media item deleted' };
  }
}
