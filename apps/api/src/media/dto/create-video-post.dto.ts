import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MediaType } from '@prisma/client';

export class CreateVideoPostDto {
  @ApiProperty({ example: 'Sunday Worship Service Live' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: MediaType, example: MediaType.LIVE_VIDEO })
  @IsEnum(MediaType)
  type: MediaType; // VIDEO or LIVE_VIDEO

  @ApiProperty({ example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
  @IsString()
  @IsNotEmpty()
  videoUrlOrId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;
}
