import { IsString } from 'class-validator';

export class CreateWordPairDto {
  @IsString()
  civilianWord: string;

  @IsString()
  undercoverWord: string;
}
