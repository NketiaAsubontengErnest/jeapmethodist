import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LeadershipService } from './leadership.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { CreateLeadershipDto } from './dto/create-leadership.dto';
import { UpdateLeadershipDto } from './dto/update-leadership.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PERMISSIONS } from '../common/constants/permissions';

@ApiTags('leadership')
@ApiBearerAuth()
@Controller('leadership')
export class LeadershipController {
  constructor(private readonly service: LeadershipService) {}

  @Get('positions')
  @RequirePermissions(PERMISSIONS.LEADERSHIP_VIEW)
  findAllPositions() {
    return this.service.findAllPositions();
  }

  @Post('positions')
  @RequirePermissions(PERMISSIONS.LEADERSHIP_CREATE)
  createPosition(
    @Body() dto: CreatePositionDto,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.createPosition(dto, actorUserId);
  }

  @Patch('positions/:id')
  @RequirePermissions(PERMISSIONS.LEADERSHIP_UPDATE)
  updatePosition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePositionDto,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.updatePosition(id, dto, actorUserId);
  }

  @Delete('positions/:id')
  @RequirePermissions(PERMISSIONS.LEADERSHIP_DELETE)
  removePosition(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.removePosition(id, actorUserId);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.LEADERSHIP_VIEW)
  findAllLeadership() {
    return this.service.findAllLeadership();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.LEADERSHIP_VIEW)
  findOneLeadership(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOneLeadership(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.LEADERSHIP_CREATE)
  createLeadership(
    @Body() dto: CreateLeadershipDto,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.createLeadership(dto, actorUserId);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.LEADERSHIP_UPDATE)
  updateLeadership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadershipDto,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.updateLeadership(id, dto, actorUserId);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.LEADERSHIP_DELETE)
  removeLeadership(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.removeLeadership(id, actorUserId);
  }
}
