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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { UpsertFamilyDto } from './dto/upsert-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { AddFamilyMemberDto } from './dto/add-family-member.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';

@ApiTags('families')
@ApiBearerAuth()
@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.MEMBER_VIEW)
  findAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
    @Query('search') search?: string,
  ) {
    return this.familiesService.findAll({
      page: parseInt(page, 10) || 1,
      pageSize: Math.min(parseInt(pageSize, 10) || 25, 100),
      search,
    });
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.MEMBER_VIEW)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.familiesService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.MEMBER_CREATE)
  create(@Body() dto: UpsertFamilyDto) {
    return this.familiesService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.MEMBER_UPDATE)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFamilyDto) {
    return this.familiesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.MEMBER_DELETE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.familiesService.remove(id);
  }

  @Post(':id/members')
  @RequirePermissions(PERMISSIONS.MEMBER_UPDATE)
  addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddFamilyMemberDto,
  ) {
    return this.familiesService.addMember(id, dto);
  }

  @Delete(':id/members/:memberId')
  @RequirePermissions(PERMISSIONS.MEMBER_UPDATE)
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.familiesService.removeMember(id, memberId);
  }
}
