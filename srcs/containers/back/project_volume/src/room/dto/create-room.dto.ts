import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  name: string;

  @IsString()
  @IsOptional()
  colyseusRoomId?: string;
}
