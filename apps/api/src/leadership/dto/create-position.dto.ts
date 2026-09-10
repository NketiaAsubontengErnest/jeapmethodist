import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
