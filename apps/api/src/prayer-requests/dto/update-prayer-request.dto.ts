import { ApiProperty } from '@nestjs/swagger';
import { PrayerRequestStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdatePrayerRequestDto {
  @ApiProperty({ enum: PrayerRequestStatus })
  @IsEnum(PrayerRequestStatus)
  status: PrayerRequestStatus;
}
