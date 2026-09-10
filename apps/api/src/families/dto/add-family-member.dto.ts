import { ApiProperty } from '@nestjs/swagger';
import { FamilyRole } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class AddFamilyMemberDto {
  @ApiProperty()
  @IsUUID()
  memberId: string;

  @ApiProperty({ enum: FamilyRole })
  @IsEnum(FamilyRole)
  role: FamilyRole;
}
