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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly service: EventsService,
    private readonly auditService: AuditService,
  ) {}

  @Public()
  @Get()
  findPublic() {
    return this.service.findPublic();
  }

  @Get('admin')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.EVENT_VIEW)
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
  @RequirePermissions(PERMISSIONS.EVENT_VIEW)
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOneAdmin(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.EVENT_CREATE)
  async create(
    @Body() dto: CreateEventDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const event = await this.service.create(dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'event.created',
      module: 'events',
      entityType: 'Event',
      entityId: event.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: { title: event.title },
    });
    return event;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.EVENT_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const event = await this.service.update(id, dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'event.updated',
      module: 'events',
      entityType: 'Event',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return event;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.EVENT_DELETE)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const result = await this.service.remove(id);
    await this.auditService.record({
      userId: actor.id,
      action: 'event.deleted',
      module: 'events',
      entityType: 'Event',
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
