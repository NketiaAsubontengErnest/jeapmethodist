import { ApiProperty } from '@nestjs/swagger';
import { FinancialTransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ enum: FinancialTransactionType })
  @IsEnum(FinancialTransactionType)
  type: FinancialTransactionType;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ required: false, description: 'Required when type is INCOME' })
  @IsOptional()
  @IsUUID()
  incomeCategoryId?: string;

  @ApiProperty({
    required: false,
    description: 'Required when type is EXPENSE',
  })
  @IsOptional()
  @IsUUID()
  expenseCategoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  financialAccountId?: string;

  @ApiProperty({ required: false, description: 'Which fund this belongs to (General, Building, Missions, ...)' })
  @IsOptional()
  @IsUUID()
  fundId?: string;

  @ApiProperty({
    required: false,
    description: 'For a named/individual gift only',
  })
  @IsOptional()
  @IsString()
  donorName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  donorMemberId?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
