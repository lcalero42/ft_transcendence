import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayerDto } from './create-player.dto';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {
  @IsString()
  @MinLength(1)
  @MaxLength(12)
  name: string;

  @IsEmail()
  email: string;
}
