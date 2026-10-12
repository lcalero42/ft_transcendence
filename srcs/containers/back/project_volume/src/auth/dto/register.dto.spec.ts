import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

async function passwordErrors(password: string) {
  const dto = new RegisterDto();
  dto.email = 'jdoe@test.com';
  dto.name = 'alice';
  dto.password = password;
  const errors = await validate(dto);
  return errors
    .filter((error) => error.property === 'password')
    .flatMap((error) => Object.values(error.constraints ?? {}));
}

describe('RegisterDto password policy', () => {
  it('should accept a password meeting every rule', async () => {
    expect(await passwordErrors('Kestrel7!maple')).toEqual([]);
  });

  it('should reject a password shorter than 8 characters', async () => {
    expect(await passwordErrors('Kes7!ma')).toHaveLength(1);
  });

  it('should reject a password longer than 72 characters', async () => {
    expect(await passwordErrors(`Kestrel7!${'m'.repeat(64)}`)).toHaveLength(1);
  });

  it('should reject a password without an uppercase letter', async () => {
    expect(await passwordErrors('kestrel7!maple')).toEqual([
      'password must contain at least one uppercase letter',
    ]);
  });

  it('should reject a password without a lowercase letter', async () => {
    expect(await passwordErrors('KESTREL7!MAPLE')).toEqual([
      'password must contain at least one lowercase letter',
    ]);
  });

  it('should reject a password without a number', async () => {
    expect(await passwordErrors('Kestrel!maple')).toEqual([
      'password must contain at least one number',
    ]);
  });

  it('should reject a password without a special character', async () => {
    expect(await passwordErrors('Kestrel7maple')).toEqual([
      'password must contain at least one special character',
    ]);
  });

  it.each(['Password1!', 'P@ssw0rd123!', 'Qwerty123!', 'W3lc0me2024#'])(
    'should reject the common password %s',
    async (password) => {
      expect(await passwordErrors(password)).toEqual([
        'password is too common',
      ]);
    },
  );

  it('should reject a password containing the username', async () => {
    expect(await passwordErrors('Kestrel7!ALICE')).toEqual([
      'password must not contain your username or email',
    ]);
  });

  it('should reject a password containing the email local part', async () => {
    expect(await passwordErrors('Kestrel7!jdoe')).toEqual([
      'password must not contain your username or email',
    ]);
  });
});
