import { IsInt, IsPositive } from 'class-validator';

export class EliminatePlayerDto {
  @IsInt()
  @IsPositive()
  playerId: number;
}
