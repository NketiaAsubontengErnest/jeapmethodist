import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsOptionalDate } from '../../common/decorators/is-optional-date.decorator';

export class CreateNewsArticleDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  featuredImageUrl?: string;

  @ApiProperty({
    required: false,
    description: 'When to publish — defaults to now',
  })
  @IsOptionalDate()
  publishedAt?: Date;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
