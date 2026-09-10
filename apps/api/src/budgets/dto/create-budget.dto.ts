import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  fundId?: string;

  @ApiProperty({ required: false, description: 'Set this OR expenseCategoryId, not both' })
  @IsOptional()
  @IsUUID()
  incomeCategoryId?: string;

  @ApiProperty({ required: false, description: 'Set this OR incomeCategoryId, not both' })
  @IsOptional()
  @IsUUID()
  expenseCategoryId?: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
