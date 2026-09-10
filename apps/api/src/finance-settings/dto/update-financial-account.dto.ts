import { PartialType } from '@nestjs/swagger';
import { UpsertFinancialAccountDto } from './upsert-financial-account.dto';

export class UpdateFinancialAccountDto extends PartialType(
  UpsertFinancialAccountDto,
) {}
