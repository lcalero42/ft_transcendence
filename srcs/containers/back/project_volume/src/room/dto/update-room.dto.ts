import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create-room.dto';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @IsString()
  @MinLength(3)
  @MaxLength(12)
  name: string;
}
