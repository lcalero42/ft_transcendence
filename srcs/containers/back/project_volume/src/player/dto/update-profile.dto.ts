import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { isUsername } from '../../common/username-policy';

export class UpdateProfileDto {
  @IsOptional()
  @isUsername()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  aboutMe?: string;
}
