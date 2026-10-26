import { applyDecorators } from '@nestjs/common';
import { IsString, Matches } from 'class-validator';

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 24;
export const USERNAME_PATTERN = /^[A-Za-z0-9_-]{3,24}$/;

export function isUsername() {
  return applyDecorators(
    IsString(),
    Matches(USERNAME_PATTERN, {
      message: `name must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters long and contain only letters, numbers, _ or -`,
    }),
  );
}
