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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AttendanceService } from './attendance.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

type GroupBy = 'day' | 'week' | 'month' | 'quarter' | 'year';
const VALID_GROUP_BY: GroupBy[] = ['day', 'week', 'month', 'quarter', 'year'];

@ApiTags('attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly auditService: AuditService,
  ) {}

  @Get('summary')
  @RequirePermissions(PERMISSIONS.ATTENDANCE_VIEW)
  getSummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('groupBy') groupBy = 'month',
  ) {
    if (!VALID_GROUP_BY.includes(groupBy as GroupBy)) {
      throw new BadRequestException(
        `groupBy must be one of: ${VALID_GROUP_BY.join(', ')}`,
      );
    }
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from
      ? new Date(from)
      : new Date(toDate.getTime() - 90 * 24 * 60 * 60 * 1000);
    return this.attendanceService.getSummary({
      from: fromDate,
      to: toDate,
      groupBy: groupBy as GroupBy,
    });
  }

  @Get('sessions')
  @RequirePermissions(PERMISSIONS.ATTENDANCE_VIEW)
  findAllSessions(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
    @Query('programmeTypeId') programmeTypeId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.attendanceService.findAllSessions({
      page: parseInt(page, 10) || 1,
      pageSize: Math.min(parseInt(pageSize, 10) || 25, 100),
      programmeTypeId,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get('sessions/:id')
  @RequirePermissions(PERMISSIONS.ATTENDANCE_VIEW)
  findSession(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.findSession(id);
  }

  @Post('sessions')
  @RequirePermissions(PERMISSIONS.ATTENDANCE_CREATE)
  async createSession(
    @Body() dto: CreateSessionDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const session = await this.attendanceService.createSession(dto, actor.id);
    await this.auditService.record({
      userId: actor.id,
      action: 'attendance.session_created',
      module: 'attendance',
      entityType: 'AttendanceSession',
      entityId: session.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return session;
  }

  @Patch('sessions/:id')
  @RequirePermissions(PERMISSIONS.ATTENDANCE_UPDATE)
  updateSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.attendanceService.updateSession(id, dto);
  }

  @Delete('sessions/:id')
  @RequirePermissions(PERMISSIONS.ATTENDANCE_DELETE)
  async removeSession(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const result = await this.attendanceService.removeSession(id);
    await this.auditService.record({
      userId: actor.id,
      action: 'attendance.session_deleted',
      module: 'attendance',
      entityType: 'AttendanceSession',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return result;
  }

  @Post('sessions/:id/records')
  @RequirePermissions(PERMISSIONS.ATTENDANCE_CREATE)
  addRecord(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateRecordDto,
  ) {
    return this.attendanceService.addRecord(id, dto);
  }

  @Patch('sessions/:id/records/:recordId')
  @RequirePermissions(PERMISSIONS.ATTENDANCE_UPDATE)
  updateRecord(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('recordId', ParseUUIDPipe) recordId: string,
    @Body() dto: UpdateRecordDto,
  ) {
    return this.attendanceService.updateRecord(id, recordId, dto);
  }

  @Delete('sessions/:id/records/:recordId')
  @RequirePermissions(PERMISSIONS.ATTENDANCE_DELETE)
  removeRecord(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('recordId', ParseUUIDPipe) recordId: string,
  ) {
    return this.attendanceService.removeRecord(id, recordId);
  }
}
