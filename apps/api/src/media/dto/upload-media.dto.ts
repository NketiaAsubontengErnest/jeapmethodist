import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';
import { MediaType } from '@prisma/client';

export class UploadMediaDto {
  @ApiPropertyOptional({ description: 'Free-text grouping, e.g. "Worship", "Youth Camp"' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: 'Sunday Choir Processional' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiPropertyOptional({ description: 'Album ID to assign photo to' })
  @IsOptional()
  @IsUUID()
  albumId?: string;
}
