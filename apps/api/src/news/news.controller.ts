import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { NewsService } from './news.service';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(
    private readonly service: NewsService,
    private readonly auditService: AuditService,
  ) {}

  @Public()
  @Get()
  findPublic() {
    return this.service.findPublic();
  }

  @Get('admin')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.NEWS_VIEW)
  findAllAdmin(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
    @Query('search') search?: string,
  ) {
    return this.service.findAllAdmin({
      page: parseInt(page, 10) || 1,
      pageSize: Math.min(parseInt(pageSize, 10) || 25, 100),
      search,
    });
  }

  @Get('admin/:id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.NEWS_VIEW)
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOneAdmin(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.NEWS_CREATE)
  async create(
    @Body() dto: CreateNewsArticleDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const article = await this.service.create(dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'news.created',
      module: 'news',
      entityType: 'NewsArticle',
      entityId: article.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: { title: article.title },
    });
    return article;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.NEWS_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNewsArticleDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const article = await this.service.update(id, dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'news.updated',
      module: 'news',
      entityType: 'NewsArticle',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return article;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.NEWS_DELETE)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const result = await this.service.remove(id);
    await this.auditService.record({
      userId: actor.id,
      action: 'news.deleted',
      module: 'news',
      entityType: 'NewsArticle',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return result;
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }
}
