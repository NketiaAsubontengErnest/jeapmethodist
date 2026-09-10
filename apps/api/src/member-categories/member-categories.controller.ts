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
import { MemberCategoriesService } from './member-categories.service';
import { UpsertMemberCategoryDto } from './dto/upsert-member-category.dto';
import { UpdateMemberCategoryDto } from './dto/update-member-category.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';

@ApiTags('member-categories')
@ApiBearerAuth()
@Controller('member-categories')
export class MemberCategoriesController {
  constructor(private readonly service: MemberCategoriesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.MEMBER_VIEW)
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  create(@Body() dto: UpsertMemberCategoryDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
