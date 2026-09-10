import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AddMinistryMemberDto {
  @IsUUID()
  memberId: string;

  @IsOptional()
  @IsString()
  roleInMinistry?: string;
}
