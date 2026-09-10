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
import { MembershipStatusesService } from './membership-statuses.service';
import { UpsertMembershipStatusDto } from './dto/upsert-membership-status.dto';
import { UpdateMembershipStatusDto } from './dto/update-membership-status.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';

@ApiTags('membership-statuses')
@ApiBearerAuth()
@Controller('membership-statuses')
export class MembershipStatusesController {
  constructor(private readonly service: MembershipStatusesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.MEMBER_VIEW)
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  create(@Body() dto: UpsertMembershipStatusDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMembershipStatusDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
