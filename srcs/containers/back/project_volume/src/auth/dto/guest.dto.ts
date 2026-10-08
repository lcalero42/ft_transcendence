import { PickType } from '@nestjs/mapped-types';
import { RegisterDto } from './register.dto';

export class GuestDto extends PickType(RegisterDto, ['name'] as const) {}
