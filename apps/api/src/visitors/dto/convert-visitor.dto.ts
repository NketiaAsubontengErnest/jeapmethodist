import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';
import { CreateMemberDto } from '../../members/dto/create-member.dto';

/**
 * Fields needed to turn a Visitor into a full Member. Name/phone/email/address
 * are pre-filled from the visitor record server-side but can be overridden here.
 * Gender, membership status and category aren't always known for a visitor, so
 * they're required here even though they're inherited as optional overrides.
 */
export class ConvertVisitorDto extends PartialType(
  OmitType(CreateMemberDto, [
    'membershipStatusId',
    'memberCategoryId',
    'gender',
  ] as const),
) {
  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty()
  @IsUUID()
  membershipStatusId: string;

  @ApiProperty()
  @IsUUID()
  memberCategoryId: string;
}
