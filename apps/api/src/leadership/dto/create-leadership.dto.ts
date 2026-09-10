import { IsEmail, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { IsOptionalDate } from '../../common/decorators/is-optional-date.decorator';

export class CreateLeadershipDto {
  @IsUUID()
  positionId: string;

  @IsOptional()
  @IsUUID()
  memberId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptionalDate()
  startDate?: Date;

  @IsOptionalDate()
  endDate?: Date;
}
