import { IsIn } from 'class-validator';
import { FriendshipStatus } from '../../generated/prisma/client';

export class UpdateFriendshipDto {
  @IsIn([
    FriendshipStatus.ACCEPTED,
    FriendshipStatus.DECLINED,
    FriendshipStatus.BLOCKED,
  ])
  status: FriendshipStatus;
}
