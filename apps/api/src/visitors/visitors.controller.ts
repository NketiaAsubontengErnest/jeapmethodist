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
import { VisitorFollowUpStatus } from '@prisma/client';
import { Request } from 'express';
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { ConvertVisitorDto } from './dto/convert-visitor.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

@ApiTags('visitors')
@ApiBearerAuth()
@Controller('visitors')
export class VisitorsController {
  constructor(
    private readonly visitorsService: VisitorsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VISITOR_VIEW)
  findAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
    @Query('search') search?: string,
    @Query('followUpStatus') followUpStatus?: VisitorFollowUpStatus,
    @Query('assignedToUserId') assignedToUserId?: string,
  ) {
    return this.visitorsService.findAll({
      page: parseInt(page, 10) || 1,
      pageSize: Math.min(parseInt(pageSize, 10) || 25, 100),
      search,
      followUpStatus,
      assignedToUserId,
    });
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.VISITOR_VIEW)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.visitorsService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.VISITOR_CREATE)
  async create(
    @Body() dto: CreateVisitorDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const visitor = await this.visitorsService.create(dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'visitor.created',
      module: 'visitors',
      entityType: 'Visitor',
      entityId: visitor.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: { name: `${visitor.firstName} ${visitor.lastName}` },
    });
    return visitor;
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.VISITOR_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVisitorDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const visitor = await this.visitorsService.update(id, dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'visitor.updated',
      module: 'visitors',
      entityType: 'Visitor',
      entityId: visitor.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return visitor;
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.VISITOR_DELETE)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const result = await this.visitorsService.remove(id);
    await this.auditService.record({
      userId: actor.id,
      action: 'visitor.deleted',
      module: 'visitors',
      entityType: 'Visitor',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return result;
  }

  @Post(':id/follow-ups')
  @RequirePermissions(PERMISSIONS.VISITOR_UPDATE)
  async addFollowUp(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateFollowUpDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const visitor = await this.visitorsService.addFollowUp(id, actor.id, dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'visitor.follow_up_recorded',
      module: 'visitors',
      entityType: 'Visitor',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: { status: dto.status },
    });
    return visitor;
  }

  @Post(':id/convert')
  @RequirePermissions(PERMISSIONS.VISITOR_UPDATE, PERMISSIONS.MEMBER_CREATE)
  async convert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConvertVisitorDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const visitor = await this.visitorsService.convertToMember(id, dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'visitor.converted_to_member',
      module: 'visitors',
      entityType: 'Visitor',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: { memberId: visitor.convertedMemberId },
    });
    return visitor;
  }
}
