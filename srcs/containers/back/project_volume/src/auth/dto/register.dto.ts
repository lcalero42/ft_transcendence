import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { isPassword } from '../../common/password-policy';

export class RegisterDto {
  @IsEmail()
  email: string;

  @isPassword()
  password: string;

  @IsString()
  @MinLength(3)
  @MaxLength(24)
  name: string;
}
