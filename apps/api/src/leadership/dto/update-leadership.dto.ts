import { PartialType } from '@nestjs/swagger';
import { CreateLeadershipDto } from './create-leadership.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateLeadershipDto extends PartialType(CreateLeadershipDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
