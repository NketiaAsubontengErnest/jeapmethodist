import { PartialType } from '@nestjs/swagger';
import { UpsertIncomeCategoryDto } from './upsert-income-category.dto';

export class UpdateIncomeCategoryDto extends PartialType(
  UpsertIncomeCategoryDto,
) {}
