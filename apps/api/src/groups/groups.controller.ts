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
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PERMISSIONS } from '../common/constants/permissions';

@ApiTags('groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupsController {
  constructor(private readonly service: GroupsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.GROUP_VIEW)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.GROUP_VIEW)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.GROUP_CREATE)
  create(@Body() dto: CreateGroupDto, @CurrentUser('id') actorUserId: string) {
    return this.service.create(dto, actorUserId);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.GROUP_UPDATE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGroupDto,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.update(id, dto, actorUserId);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.GROUP_DELETE)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.remove(id, actorUserId);
  }

  @Post(':id/members')
  @RequirePermissions(PERMISSIONS.GROUP_UPDATE)
  addMember(
    @Param('id', ParseUUIDPipe) groupId: string,
    @Body() dto: AddGroupMemberDto,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.addMember(groupId, dto, actorUserId);
  }

  @Delete(':id/members/:memberId')
  @RequirePermissions(PERMISSIONS.GROUP_UPDATE)
  removeMember(
    @Param('id', ParseUUIDPipe) groupId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.removeMember(groupId, memberId, actorUserId);
  }
}
