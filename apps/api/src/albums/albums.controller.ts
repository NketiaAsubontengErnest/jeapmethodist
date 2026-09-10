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
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('albums')
@Controller('albums')
export class AlbumsController {
  constructor(
    private readonly service: AlbumsService,
    private readonly auditService: AuditService,
  ) {}

  @Public()
  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
  ) {
    return this.service.findAll({
      page: parseInt(page, 10) || 1,
      pageSize: Math.min(parseInt(pageSize, 10) || 25, 100),
    });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.MEDIA_UPLOAD)
  async create(
    @Body() dto: CreateAlbumDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const album = await this.service.create(dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'album.created',
      module: 'media',
      entityType: 'Album',
      entityId: album.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: { title: album.title },
    });
    return album;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.MEDIA_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAlbumDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const album = await this.service.update(id, dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'album.updated',
      module: 'media',
      entityType: 'Album',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return album;
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
      action: 'album.deleted',
      module: 'media',
      entityType: 'Album',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return result;
  }
}
