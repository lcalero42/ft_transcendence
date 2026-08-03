// create-auth.dto.ts (or wherever your register/login DTOs live)
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt silently truncates beyond 72 bytes — worth capping explicitly
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;
}
