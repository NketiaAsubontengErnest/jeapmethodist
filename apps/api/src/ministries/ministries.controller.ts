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
import { MinistriesService } from './ministries.service';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';
import { AddMinistryMemberDto } from './dto/add-ministry-member.dto';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PERMISSIONS } from '../common/constants/permissions';

@ApiTags('ministries')
@ApiBearerAuth()
@Controller('ministries')
export class MinistriesController {
  constructor(private readonly service: MinistriesService) {}

  @Public()
  @Get('public')
  findPublic() {
    return this.service.findPublic();
  }

  @Public()
  @Get('public/:slug')
  findPublicBySlug(@Param('slug') slug: string) {
    return this.service.findPublicBySlug(slug);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.MINISTRY_VIEW)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.MINISTRY_VIEW)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.MINISTRY_CREATE)
  create(
    @Body() dto: CreateMinistryDto,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.create(dto, actorUserId);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.MINISTRY_UPDATE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMinistryDto,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.update(id, dto, actorUserId);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.MINISTRY_DELETE)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.remove(id, actorUserId);
  }

  @Post(':id/members')
  @RequirePermissions(PERMISSIONS.MINISTRY_UPDATE)
  addMember(
    @Param('id', ParseUUIDPipe) ministryId: string,
    @Body() dto: AddMinistryMemberDto,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.addMember(ministryId, dto, actorUserId);
  }

  @Delete(':id/members/:memberId')
  @RequirePermissions(PERMISSIONS.MINISTRY_UPDATE)
  removeMember(
    @Param('id', ParseUUIDPipe) ministryId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser('id') actorUserId: string,
  ) {
    return this.service.removeMember(ministryId, memberId, actorUserId);
  }
}
