import { PartialType } from '@nestjs/swagger';
import { UpsertExpenseCategoryDto } from './upsert-expense-category.dto';

export class UpdateExpenseCategoryDto extends PartialType(
  UpsertExpenseCategoryDto,
) {}
