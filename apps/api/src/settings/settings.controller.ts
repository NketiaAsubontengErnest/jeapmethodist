import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Public()
  @Get('public')
  getPublicSettings() {
    return this.service.getPublicSettings();
  }

  @ApiBearerAuth()
  @Get()
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  getAllSettings() {
    return this.service.getAllSettings();
  }

  @ApiBearerAuth()
  @Patch()
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.service.updateBulkSettings(dto);
  }
}
