import { PartialType } from '@nestjs/swagger';
import { CreateGroupDto } from './create-group.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
