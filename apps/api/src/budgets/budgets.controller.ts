import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';

@ApiTags('budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly service: BudgetsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FINANCE_VIEW)
  findAll(@Query('year') year?: string) {
    return this.service.findAll({ year: year ? parseInt(year, 10) : undefined });
  }

  @Get('vs-actual')
  @RequirePermissions(PERMISSIONS.FINANCE_REPORT)
  getVsActual(@Query('year') year: string) {
    return this.service.getVsActual(year ? parseInt(year, 10) : new Date().getFullYear());
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_VIEW)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.FINANCE_CREATE)
  create(@Body() dto: CreateBudgetDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_UPDATE)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBudgetDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_DELETE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
