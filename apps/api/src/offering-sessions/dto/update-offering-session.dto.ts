import { PartialType } from '@nestjs/swagger';
import { UpsertOfferingSessionDto } from './upsert-offering-session.dto';

export class UpdateOfferingSessionDto extends PartialType(
  UpsertOfferingSessionDto,
) {}
