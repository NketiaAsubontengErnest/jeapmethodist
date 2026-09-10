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
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly service: AnnouncementsService,
    private readonly auditService: AuditService,
  ) {}

  @Public()
  @Get()
  findPublic() {
    return this.service.findPublic();
  }

  @Get('admin')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.ANNOUNCEMENT_VIEW)
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
  @RequirePermissions(PERMISSIONS.ANNOUNCEMENT_VIEW)
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOneAdmin(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.ANNOUNCEMENT_CREATE)
  async create(
    @Body() dto: CreateAnnouncementDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const announcement = await this.service.create(dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'announcement.created',
      module: 'announcement',
      entityType: 'Announcement',
      entityId: announcement.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: { title: announcement.title },
    });
    return announcement;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.ANNOUNCEMENT_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnnouncementDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const announcement = await this.service.update(id, dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'announcement.updated',
      module: 'announcement',
      entityType: 'Announcement',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return announcement;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.ANNOUNCEMENT_DELETE)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const result = await this.service.remove(id);
    await this.auditService.record({
      userId: actor.id,
      action: 'announcement.deleted',
      module: 'announcement',
      entityType: 'Announcement',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return result;
  }
}
