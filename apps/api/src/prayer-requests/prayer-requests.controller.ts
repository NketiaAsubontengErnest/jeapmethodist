import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PrayerRequestsService } from './prayer-requests.service';
import { CreatePrayerRequestDto } from './dto/create-prayer-request.dto';
import { UpdatePrayerRequestDto } from './dto/update-prayer-request.dto';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';

@ApiTags('prayer-requests')
@Controller('prayer-requests')
export class PrayerRequestsController {
  constructor(private readonly service: PrayerRequestsService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePrayerRequestDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.PRAYER_REQUEST_VIEW)
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.PRAYER_REQUEST_UPDATE)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrayerRequestDto,
  ) {
    return this.service.updateStatus(id, dto);
  }
}
