import { ApiProperty, PartialType } from '@nestjs/swagger';
import { VisitorFollowUpStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateVisitorDto } from './create-visitor.dto';

export class UpdateVisitorDto extends PartialType(CreateVisitorDto) {
  @ApiProperty({ required: false, enum: VisitorFollowUpStatus })
  @IsOptional()
  @IsEnum(VisitorFollowUpStatus)
  followUpStatus?: VisitorFollowUpStatus;
}
