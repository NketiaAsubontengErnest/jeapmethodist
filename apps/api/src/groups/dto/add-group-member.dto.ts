import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AddGroupMemberDto {
  @IsUUID()
  memberId: string;

  @IsOptional()
  @IsString()
  roleInGroup?: string;
}
