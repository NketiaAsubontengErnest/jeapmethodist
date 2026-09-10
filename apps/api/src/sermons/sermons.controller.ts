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
import { SermonsService } from './sermons.service';
import { CreateSermonDto } from './dto/create-sermon.dto';
import { UpdateSermonDto } from './dto/update-sermon.dto';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

@ApiTags('sermons')
@Controller('sermons')
export class SermonsController {
  constructor(
    private readonly service: SermonsService,
    private readonly auditService: AuditService,
  ) {}

  @Public()
  @Get()
  findPublic() {
    return this.service.findPublic();
  }

  @Get('admin')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.SERMON_VIEW)
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
  @RequirePermissions(PERMISSIONS.SERMON_VIEW)
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOneAdmin(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.SERMON_CREATE)
  async create(
    @Body() dto: CreateSermonDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const sermon = await this.service.create(dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'sermon.created',
      module: 'sermons',
      entityType: 'Sermon',
      entityId: sermon.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: { title: sermon.title },
    });
    return sermon;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.SERMON_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSermonDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const sermon = await this.service.update(id, dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'sermon.updated',
      module: 'sermons',
      entityType: 'Sermon',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return sermon;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.SERMON_DELETE)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const result = await this.service.remove(id);
    await this.auditService.record({
      userId: actor.id,
      action: 'sermon.deleted',
      module: 'sermons',
      entityType: 'Sermon',
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
