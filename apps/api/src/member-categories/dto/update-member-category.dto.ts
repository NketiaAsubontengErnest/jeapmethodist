import { PartialType } from '@nestjs/swagger';
import { UpsertMemberCategoryDto } from './upsert-member-category.dto';

export class UpdateMemberCategoryDto extends PartialType(
  UpsertMemberCategoryDto,
) {}
