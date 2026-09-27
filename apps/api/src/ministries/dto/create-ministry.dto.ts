import { IsEmail, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';

export class CreateMinistryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  meetingSchedule?: string;

  @IsOptional()
  @IsString()
  meetingVenue?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @ValidateIf((o) => Boolean(o.contactEmail && o.contactEmail.trim()))
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsUUID()
  leaderMemberId?: string;

  @IsOptional()
  @IsUUID()
  assistantLeaderMemberId?: string;
}
