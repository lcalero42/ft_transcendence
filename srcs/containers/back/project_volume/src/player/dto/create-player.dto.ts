import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(12)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  aboutMe: string;
  avatarUrl: string;
}
