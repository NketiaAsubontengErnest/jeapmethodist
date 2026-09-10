import { ApiProperty } from '@nestjs/swagger';
import { FinancialAccountType } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpsertFinancialAccountDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: FinancialAccountType })
  @IsEnum(FinancialAccountType)
  accountType: FinancialAccountType;

  @ApiProperty({
    required: false,
    description: 'Last 4 digits or similar partial reference only',
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
