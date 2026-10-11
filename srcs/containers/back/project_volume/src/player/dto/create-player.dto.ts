import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { isPassword } from '../../common/password-policy';

export class CreatePlayerDto {
  @IsString()
  @MinLength(3)
  @MaxLength(24)
  name: string;

  @IsEmail()
  email: string;

  @isPassword()
  password: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  aboutMe: string;

  @IsString()
  avatarUrl: string;
}
