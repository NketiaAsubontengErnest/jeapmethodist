import { ApiProperty } from '@nestjs/swagger';
import { Gender, MaritalStatus } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { IsOptionalDate } from '../../common/decorators/is-optional-date.decorator';

export class CreateMemberDto {
  @ApiProperty({
    required: false,
    description: 'Auto-generated if not provided',
  })
  @IsOptional()
  @IsString()
  membershipNumber?: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ required: false })
  @IsOptionalDate()
  dateOfBirth?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  residentialAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  digitalAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ghanaRegion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ghanaDistrict?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiProperty({ required: false, enum: MaritalStatus })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @ApiProperty({ required: false })
  @IsOptionalDate()
  marriageDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyContactRelationship?: string;

  @ApiProperty({ required: false })
  @IsOptionalDate()
  dateJoinedChurch?: Date;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  baptized?: boolean;

  @ApiProperty({ required: false })
  @IsOptionalDate()
  baptismDate?: Date;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  confirmed?: boolean;

  @ApiProperty({ required: false })
  @IsOptionalDate()
  confirmationDate?: Date;

  @ApiProperty()
  @IsUUID()
  membershipStatusId: string;

  @ApiProperty()
  @IsUUID()
  memberCategoryId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  localSociety?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  groupIds?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  ministryIds?: string[];
}

