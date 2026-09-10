import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { slugify } from '../common/utils/slugify.util';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic() {
    return this.prisma.newsArticle.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.newsArticle.findUnique({
      where: { slug },
    });
    if (!article || !article.isPublished) {
      throw new NotFoundException('News article not found');
    }
    return article;
  }

  async findAllAdmin(params: {
    page: number;
    pageSize: number;
    search?: string;
  }) {
    const { page, pageSize, search } = params;
    const where: Prisma.NewsArticleWhereInput = search
      ? { title: { contains: search, mode: 'insensitive' } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.newsArticle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.newsArticle.count({ where }),
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
    const article = await this.prisma.newsArticle.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('News article not found');
    }
    return article;
  }

  private async generateUniqueSlug(title: string, excludeId?: string) {
    const base = slugify(title);
    let slug = base;
    let suffix = 1;
    while (
      await this.prisma.newsArticle.findFirst({
        where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      })
    ) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
    return slug;
  }

  async create(dto: CreateNewsArticleDto) {
    const slug = await this.generateUniqueSlug(dto.title);
    return this.prisma.newsArticle.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: UpdateNewsArticleDto) {
    const existing = await this.findOneAdmin(id);
    const slug =
      dto.title && dto.title !== existing.title
        ? await this.generateUniqueSlug(dto.title, id)
        : undefined;

    try {
      return await this.prisma.newsArticle.update({
        where: { id },
        data: { ...dto, ...(slug ? { slug } : {}) },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A news article with this title already exists',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOneAdmin(id);
    await this.prisma.newsArticle.delete({ where: { id } });
    return { message: 'News article deleted' };
  }
}
