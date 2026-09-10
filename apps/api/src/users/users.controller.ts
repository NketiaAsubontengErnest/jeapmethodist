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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USER_VIEW)
  findAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({
      page: parseInt(page, 10) || 1,
      pageSize: Math.min(parseInt(pageSize, 10) || 25, 100),
      search,
    });
  }

  @Patch('me/profile')
  async updateProfile(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
    @Req() req: Request,
  ) {
    const user = await this.usersService.updateProfile(actor.id, dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'user.profile_updated',
      module: 'users',
      entityType: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: user,
    });
    return user;
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USER_VIEW)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USER_CREATE)
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const user = await this.usersService.create(dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'user.created',
      module: 'users',
      entityType: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: { email: user.email, role: user.role.name },
    });
    return user;
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USER_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const before = await this.usersService.findOne(id);
    const user = await this.usersService.update(id, dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'user.updated',
      module: 'users',
      entityType: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      previousValue: before,
      newValue: user,
    });
    return user;
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.USER_DELETE)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const user = await this.usersService.remove(id);
    await this.auditService.record({
      userId: actor.id,
      action: 'user.deactivated',
      module: 'users',
      entityType: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return user;
  }
}
