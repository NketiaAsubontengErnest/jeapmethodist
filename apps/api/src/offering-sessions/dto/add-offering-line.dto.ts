import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class AddOfferingLineDto {
  @ApiProperty({ description: 'e.g. General offering, Tithe, Missions' })
  @IsUUID()
  incomeCategoryId: string;

  @ApiProperty({
    description:
      'Aggregate total collected for this category — not an individual donor amount',
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
