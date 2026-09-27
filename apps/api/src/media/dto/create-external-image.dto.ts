import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateExternalImageDto {
  @ApiProperty({ example: 'https://scontent-xyz.fbcdn.net/v/....jpg', description: 'Direct image URL (Facebook, Cloudinary, Dropbox, etc.)' })
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'imageUrl must be a valid URL' })
  imageUrl: string;

  @ApiPropertyOptional({ example: 'Annual Harvest 2026 – Opening Banner' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'hero_slide' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
