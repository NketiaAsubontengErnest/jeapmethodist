import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import {
  BadRequestException,
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { MediaType } from '@prisma/client';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { CreateVideoPostDto } from './dto/create-video-post.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { Public } from '../common/decorators/public.decorator';
import {
  MEDIA_ALLOWED_MIME_TYPES,
  MEDIA_MAX_FILE_SIZE_BYTES,
  MEDIA_UPLOAD_DIR,
} from './media.constants';

if (!existsSync(MEDIA_UPLOAD_DIR)) {
  mkdirSync(MEDIA_UPLOAD_DIR, { recursive: true });
}

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly service: MediaService,
    private readonly auditService: AuditService,
  ) {}

  @Public()
  @Get('public/gallery')
  getPublicGallery(
    @Query('type') type?: MediaType,
    @Query('albumId') albumId?: string,
    @Query('limit') limit = '50',
  ) {
    return this.service.findPublicGallery({
      type,
      albumId,
      limit: parseInt(limit, 10) || 50,
    });
  }

  @Get('admin')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.MEDIA_VIEW)
  findAllAdmin(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
    @Query('category') category?: string,
    @Query('type') type?: MediaType,
    @Query('albumId') albumId?: string,
  ) {
    return this.service.findAllAdmin({
      page: parseInt(page, 10) || 1,
      pageSize: Math.min(parseInt(pageSize, 10) || 25, 100),
      category,
      type,
      albumId,
    });
  }

  @Post('video-post')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.MEDIA_UPLOAD)
  async createVideoPost(
    @Body() dto: CreateVideoPostDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const media = await this.service.createVideoPost(dto, actor.id);
    await this.auditService.record({
      userId: actor.id,
      action: 'media.video_posted',
      module: 'media',
      entityType: 'Media',
      entityId: media.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: { title: media.title, type: media.type },
    });
    return media;
  }

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @RequirePermissions(PERMISSIONS.MEDIA_UPLOAD)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: MEDIA_UPLOAD_DIR,
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: MEDIA_MAX_FILE_SIZE_BYTES,
        files: 1,
        fields: 10,
        fieldNameSize: 100,
        fieldSize: 1024,
      },
      fileFilter: (_req, file, callback) => {
        if (!MEDIA_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(new BadRequestException('Unsupported file type'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const media = await this.service.create({
      filename: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      category: dto.category,
      title: dto.title,
      description: dto.description,
      type: dto.type || MediaType.PHOTO,
      albumId: dto.albumId,
      uploadedById: actor.id,
    });
    await this.auditService.record({
      userId: actor.id,
      action: 'media.uploaded',
      module: 'media',
      entityType: 'Media',
      entityId: media.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: { filename: media.filename, albumId: dto.albumId },
    });
    return media;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.MEDIA_UPLOAD)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { title?: string; description?: string; category?: string; albumId?: string },
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const media = await this.service.update(id, body);
    await this.auditService.record({
      userId: actor.id,
      action: 'media.updated',
      module: 'media',
      entityType: 'Media',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: { title: media.title, description: media.description },
    });
    return media;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.MEDIA_DELETE)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const result = await this.service.remove(id);
    await this.auditService.record({
      userId: actor.id,
      action: 'media.deleted',
      module: 'media',
      entityType: 'Media',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return result;
  }
}
