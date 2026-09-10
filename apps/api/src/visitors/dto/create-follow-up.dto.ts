import { ApiProperty } from '@nestjs/swagger';
import { VisitorFollowUpStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateFollowUpDto {
  @ApiProperty({ enum: VisitorFollowUpStatus })
  @IsEnum(VisitorFollowUpStatus)
  status: VisitorFollowUpStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
