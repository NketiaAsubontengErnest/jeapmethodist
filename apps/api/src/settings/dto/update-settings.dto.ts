import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

/**
 * Every field is optional and independently upserted — only the keys present
 * in the request body are changed. Property names are snake_case to match
 * the ChurchSetting.key values already used by the seed data and the public
 * website layout (church_name, sunday_service_times, ...) rather than a
 * separate camelCase convention. Matches the CMS-manageable fields from
 * section 26 of the build spec; storage stays a flexible key-value table
 * (ChurchSetting) but writes are restricted to this known whitelist rather
 * than accepting an arbitrary key-value map.
 */
export class UpdateSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  church_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  tagline?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logo_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  favicon_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  sunday_service_times?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  midweek_service_times?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  about_text?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  mission?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  vision?: string;

  @ApiProperty({
    required: false,
    description: 'Mobile money number for giving',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  momo_number?: string;

  @ApiProperty({ required: false, description: 'Bank name for giving' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bank_name?: string;

  @ApiProperty({
    required: false,
    description: 'Bank account number for giving',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bank_account_number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  facebook_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  youtube_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  instagram_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tiktok_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  x_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  hero_title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  hero_subtitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  footer_text?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  society_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  slogan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  secretariat_hours?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  sunday_service_1?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  sunday_service_2?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  midweek_service?: string;
}
