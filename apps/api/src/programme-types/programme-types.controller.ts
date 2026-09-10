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
import { ProgrammeTypesService } from './programme-types.service';
import { UpsertProgrammeTypeDto } from './dto/upsert-programme-type.dto';
import { UpdateProgrammeTypeDto } from './dto/update-programme-type.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';

@ApiTags('programme-types')
@ApiBearerAuth()
@Controller('programme-types')
export class ProgrammeTypesController {
  constructor(private readonly service: ProgrammeTypesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ATTENDANCE_VIEW)
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  create(@Body() dto: UpsertProgrammeTypeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProgrammeTypeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
