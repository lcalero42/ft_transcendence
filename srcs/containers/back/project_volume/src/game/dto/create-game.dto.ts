import {
  IsInt,
  IsPositive,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../../generated/prisma/client';

export class GamePlayerDto {
  @IsInt()
  @IsPositive()
  playerId: number;

  @IsEnum(Role)
  role: Role;
}

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  civilianWord: string;

  @IsString()
  @IsNotEmpty()
  undercoverWord: string;

  @IsInt()
  @IsPositive()
  roomId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => GamePlayerDto)
  players: GamePlayerDto[];
}
