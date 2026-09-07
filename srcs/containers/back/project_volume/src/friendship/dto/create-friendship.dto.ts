import { IsInt, IsPositive, } from 'class-validator';

export class CreateFriendshipDto
{
  @IsInt()
  @IsPositive()
  addressee: number;
}
