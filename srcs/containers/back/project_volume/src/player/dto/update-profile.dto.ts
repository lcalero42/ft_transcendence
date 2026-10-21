import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(24)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  aboutMe?: string;
}
