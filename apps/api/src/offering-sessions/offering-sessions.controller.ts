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
import { OfferingSessionsService } from './offering-sessions.service';
import { UpsertOfferingSessionDto } from './dto/upsert-offering-session.dto';
import { UpdateOfferingSessionDto } from './dto/update-offering-session.dto';
import { AddOfferingLineDto } from './dto/add-offering-line.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

@ApiTags('offering-sessions')
@ApiBearerAuth()
@Controller('offering-sessions')
export class OfferingSessionsController {
  constructor(
    private readonly offeringSessionsService: OfferingSessionsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FINANCE_VIEW)
  findAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
    @Query('programmeTypeId') programmeTypeId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.offeringSessionsService.findAll({
      page: parseInt(page, 10) || 1,
      pageSize: Math.min(parseInt(pageSize, 10) || 25, 100),
      programmeTypeId,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_VIEW)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.offeringSessionsService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.FINANCE_CREATE)
  async create(
    @Body() dto: UpsertOfferingSessionDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const session = await this.offeringSessionsService.create(dto, actor.id);
    await this.auditService.record({
      userId: actor.id,
      action: 'finance.offering_session_created',
      module: 'finance',
      entityType: 'OfferingSession',
      entityId: session.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return session;
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_UPDATE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOfferingSessionDto,
  ) {
    return this.offeringSessionsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_DELETE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.offeringSessionsService.remove(id);
  }

  @Post(':id/lines')
  @RequirePermissions(PERMISSIONS.FINANCE_CREATE)
  async addLine(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddOfferingLineDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const session = await this.offeringSessionsService.addLine(
      id,
      dto,
      actor.id,
    );
    await this.auditService.record({
      userId: actor.id,
      action: 'finance.offering_line_recorded',
      module: 'finance',
      entityType: 'OfferingSession',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: { incomeCategoryId: dto.incomeCategoryId, amount: dto.amount },
    });
    return session;
  }

  @Delete(':id/lines/:transactionId')
  @RequirePermissions(PERMISSIONS.FINANCE_DELETE)
  removeLine(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ) {
    return this.offeringSessionsService.removeLine(id, transactionId);
  }
}
