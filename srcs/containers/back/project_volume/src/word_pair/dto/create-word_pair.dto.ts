import { IsString } from 'class-validator';

export class CreateWordPairDto {
  @IsString()
  civilianWord: string;

  @IsString()
  undercoverWord: string;

  @IsString()
  civilianWordFr: string;

  @IsString()
  undercoverWordFr: string;

  @IsString()
  civilianWordEs: string;

  @IsString()
  undercoverWordEs: string;
}
