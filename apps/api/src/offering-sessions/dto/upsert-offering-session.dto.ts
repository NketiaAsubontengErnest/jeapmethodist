import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpsertOfferingSessionDto {
  @ApiProperty()
  @IsUUID()
  programmeTypeId: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  sessionDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
