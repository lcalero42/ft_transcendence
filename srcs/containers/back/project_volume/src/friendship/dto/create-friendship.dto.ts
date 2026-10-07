import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFriendshipDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
