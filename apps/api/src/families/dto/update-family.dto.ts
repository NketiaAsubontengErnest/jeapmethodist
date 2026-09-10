import { PartialType } from '@nestjs/swagger';
import { UpsertFamilyDto } from './upsert-family.dto';

export class UpdateFamilyDto extends PartialType(UpsertFamilyDto) {}
