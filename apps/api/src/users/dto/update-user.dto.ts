import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @ApiProperty({
    required: false,
    description: 'Only provide to reset the password directly',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
