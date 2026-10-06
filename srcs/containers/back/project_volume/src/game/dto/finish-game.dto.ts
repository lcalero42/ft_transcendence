import { IsEnum } from 'class-validator';
import { Role } from '../../generated/prisma/client';

export class FinishGameDto {
  @IsEnum(Role)
  victory: Role;
}
