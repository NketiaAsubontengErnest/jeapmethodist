import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateGroupDto {
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
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsUUID()
  leaderMemberId?: string;

  @IsOptional()
  @IsUUID()
  assistantLeaderMemberId?: string;
}
