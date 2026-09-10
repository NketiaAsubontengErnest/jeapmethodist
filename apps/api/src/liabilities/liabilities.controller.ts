import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LiabilitiesService } from './liabilities.service';
import { CreateLiabilityDto } from './dto/create-liability.dto';
import { UpdateLiabilityDto } from './dto/update-liability.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';

@ApiTags('liabilities')
@ApiBearerAuth()
@Controller('liabilities')
export class LiabilitiesController {
  constructor(private readonly service: LiabilitiesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FINANCE_VIEW)
  findAll(@Query('isSettled') isSettled?: string) {
    return this.service.findAll({
      isSettled: isSettled !== undefined ? isSettled === 'true' : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_VIEW)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.FINANCE_CREATE)
  create(@Body() dto: CreateLiabilityDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_UPDATE)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLiabilityDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_DELETE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
