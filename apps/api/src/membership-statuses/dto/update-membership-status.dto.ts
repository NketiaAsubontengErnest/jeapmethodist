import { PartialType } from '@nestjs/swagger';
import { UpsertMembershipStatusDto } from './upsert-membership-status.dto';

export class UpdateMembershipStatusDto extends PartialType(
  UpsertMembershipStatusDto,
) {}
