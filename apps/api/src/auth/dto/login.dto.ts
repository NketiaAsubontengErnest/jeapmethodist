import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@sampleMethodistSociety.dev' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'DevPassword!2026' })
  @IsString()
  @MinLength(8)
  password: string;
}
