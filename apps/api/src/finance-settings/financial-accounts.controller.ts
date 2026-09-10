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
import { FinancialAccountsService } from './financial-accounts.service';
import { UpsertFinancialAccountDto } from './dto/upsert-financial-account.dto';
import { UpdateFinancialAccountDto } from './dto/update-financial-account.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';

@ApiTags('financial-accounts')
@ApiBearerAuth()
@Controller('financial-accounts')
export class FinancialAccountsController {
  constructor(private readonly service: FinancialAccountsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FINANCE_VIEW)
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @RequirePermissions(PERMISSIONS.FINANCE_CREATE)
  create(@Body() dto: UpsertFinancialAccountDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_UPDATE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFinancialAccountDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_UPDATE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
