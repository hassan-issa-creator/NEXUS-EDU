import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { Role } from '../role.enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsEnum(Role)
  role: Role;

  @IsString()
  @MinLength(2)
  name?: string;
}
