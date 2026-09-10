import { PartialType } from '@nestjs/swagger';
import { CreateMinistryDto } from './create-ministry.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMinistryDto extends PartialType(CreateMinistryDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
