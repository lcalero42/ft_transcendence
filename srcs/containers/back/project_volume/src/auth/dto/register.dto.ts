import { IsEmail } from 'class-validator';
import { isPassword } from '../../common/password-policy';
import { isUsername } from '../../common/username-policy';

export class RegisterDto {
  @IsEmail()
  email: string;

  @isPassword()
  password: string;

  @isUsername()
  name: string;
}
