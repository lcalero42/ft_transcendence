import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export const isPassword = () =>
  applyDecorators(
    IsString(),
    MinLength(PASSWORD_MIN_LENGTH),
    MaxLength(PASSWORD_MAX_LENGTH),
    Matches(/[A-Z]/, {
      message: 'password must contain at least one uppercase letter',
    }),
    Matches(/[a-z]/, {
      message: 'password must contain at least one lowercase letter',
    }),
    Matches(/[0-9]/, {
      message: 'password must contain at least one number',
    }),
    Matches(/[^A-Za-z0-9]/, {
      message: 'password must contain at least one special character',
    }),
  );
