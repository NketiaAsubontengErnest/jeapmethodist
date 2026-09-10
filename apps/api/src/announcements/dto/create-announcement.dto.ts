import { ApiProperty } from '@nestjs/swagger';
import { AnnouncementPriority } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsOptionalDate } from '../../common/decorators/is-optional-date.decorator';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  message: string;

  @ApiProperty({ enum: AnnouncementPriority, required: false, default: 'NORMAL' })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ required: false, description: 'Optional — the announcement stops showing publicly after this date' })
  @IsOptionalDate()
  expiresAt?: Date;
}
