import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRecordDto {
  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({
    required: false,
    description: 'Required for PRESENT/ABSENT/EXCUSED',
  })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiProperty({
    required: false,
    description: 'Optional link to a known Visitor record',
  })
  @IsOptional()
  @IsUUID()
  visitorId?: string;

  @ApiProperty({
    required: false,
    description: 'Freeform name for an unlinked visitor headcount entry',
  })
  @IsOptional()
  @IsString()
  visitorName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
