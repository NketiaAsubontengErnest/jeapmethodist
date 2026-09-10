import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { IsOptionalDate } from '../../common/decorators/is-optional-date.decorator';

export class CreateLiabilityDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ required: false, description: 'Defaults to today' })
  @IsOptionalDate()
  incurredDate?: Date;

  @ApiProperty({ required: false })
  @IsOptionalDate()
  dueDate?: Date;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isSettled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
