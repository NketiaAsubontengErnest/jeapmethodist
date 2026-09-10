import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty()
  @IsUUID()
  programmeTypeId: string;

  @ApiProperty({
    required: false,
    description: 'Optional label, e.g. "Christmas Carol Service"',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  sessionDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
