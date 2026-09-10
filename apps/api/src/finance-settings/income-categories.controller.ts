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
import { IncomeCategoriesService } from './income-categories.service';
import { UpsertIncomeCategoryDto } from './dto/upsert-income-category.dto';
import { UpdateIncomeCategoryDto } from './dto/update-income-category.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';

@ApiTags('income-categories')
@ApiBearerAuth()
@Controller('income-categories')
export class IncomeCategoriesController {
  constructor(private readonly service: IncomeCategoriesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FINANCE_VIEW)
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @RequirePermissions(PERMISSIONS.FINANCE_CREATE)
  create(@Body() dto: UpsertIncomeCategoryDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_UPDATE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncomeCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_UPDATE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
