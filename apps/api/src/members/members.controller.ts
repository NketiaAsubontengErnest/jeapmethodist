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
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

@ApiTags('members')
@ApiBearerAuth()
@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.MEMBER_VIEW)
  findAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
    @Query('search') search?: string,
    @Query('membershipStatusId') membershipStatusId?: string,
    @Query('memberCategoryId') memberCategoryId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.membersService.findAll({
      page: parseInt(page, 10) || 1,
      pageSize: Math.min(parseInt(pageSize, 10) || 25, 100),
      search,
      membershipStatusId,
      memberCategoryId,
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Get('birthdays')
  @RequirePermissions(PERMISSIONS.MEMBER_VIEW)
  getUpcomingBirthdays() {
    return this.membersService.getUpcomingBirthdays();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.MEMBER_VIEW)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.membersService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.MEMBER_CREATE)
  async create(
    @Body() dto: CreateMemberDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const member = await this.membersService.create(dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'member.created',
      module: 'members',
      entityType: 'Member',
      entityId: member.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: {
        membershipNumber: member.membershipNumber,
        name: `${member.firstName} ${member.lastName}`,
      },
    });
    return member;
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.MEMBER_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const before = await this.membersService.findOne(id);
    const member = await this.membersService.update(id, dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'member.updated',
      module: 'members',
      entityType: 'Member',
      entityId: member.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      previousValue: before,
      newValue: member,
    });
    return member;
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.MEMBER_DELETE)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const member = await this.membersService.remove(id);
    await this.auditService.record({
      userId: actor.id,
      action: 'member.deactivated',
      module: 'members',
      entityType: 'Member',
      entityId: member.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return member;
  }
}
