import { applyDecorators } from '@nestjs/common';
import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateBy,
  ValidationArguments,
} from 'class-validator';
import { COMMON_PASSWORD_BASES } from './common-passwords';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
const IDENTITY_MIN_LENGTH = 3;

const LEET_LETTERS: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '0': 'o',
  '1': 'i',
  '!': 'i',
  '3': 'e',
  $: 's',
  '5': 's',
  '7': 't',
};

type PasswordOwner = { name?: unknown; email?: unknown };

export function isCommonPassword(password: string) {
  const base = password
    .toLowerCase()
    .replace(/^[^a-z@$]+|[^a-z]+$/g, '')
    .replace(/[@401!3$57]/g, (character) => LEET_LETTERS[character])
    .replace(/[^a-z]/g, '');
  return COMMON_PASSWORD_BASES.has(base);
}

export function passwordContainsIdentity(
  password: string,
  { name, email }: PasswordOwner,
) {
  const loweredPassword = password.toLowerCase();
  const emailLocalPart = typeof email === 'string' ? email.split('@')[0] : '';
  return [name, emailLocalPart]
    .filter((fragment) => typeof fragment === 'string')
    .map((fragment) => fragment.trim().toLowerCase())
    .some(
      (fragment) =>
        fragment.length >= IDENTITY_MIN_LENGTH &&
        loweredPassword.includes(fragment),
    );
}

const isNotCommonPassword = () =>
  ValidateBy({
    name: 'isNotCommonPassword',
    validator: {
      validate: (value: unknown) =>
        typeof value === 'string' && !isCommonPassword(value),
      defaultMessage: () => 'password is too common',
    },
  });

const doesNotContainIdentity = () =>
  ValidateBy({
    name: 'doesNotContainIdentity',
    validator: {
      validate: (value: unknown, validationArguments?: ValidationArguments) =>
        typeof value === 'string' &&
        !passwordContainsIdentity(value, validationArguments?.object ?? {}),
      defaultMessage: () => 'password must not contain your username or email',
    },
  });

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
    isNotCommonPassword(),
    doesNotContainIdentity(),
  );
