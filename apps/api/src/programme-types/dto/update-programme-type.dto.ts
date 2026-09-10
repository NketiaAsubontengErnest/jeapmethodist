import { PartialType } from '@nestjs/swagger';
import { UpsertProgrammeTypeDto } from './upsert-programme-type.dto';

export class UpdateProgrammeTypeDto extends PartialType(
  UpsertProgrammeTypeDto,
) {}
