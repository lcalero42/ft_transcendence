import { IsInt, IsPositive, IsString, IsNotEmpty } from 'class-validator';

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
}
