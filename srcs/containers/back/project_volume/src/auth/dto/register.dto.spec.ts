import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

async function passwordErrors(password: string) {
  const dto = new RegisterDto();
  dto.email = 'alice@test.com';
  dto.name = 'alice';
  dto.password = password;
  const errors = await validate(dto);
  return errors
    .filter((error) => error.property === 'password')
    .flatMap((error) => Object.values(error.constraints ?? {}));
}

describe('RegisterDto password policy', () => {
  it('should accept a password meeting every rule', async () => {
    expect(await passwordErrors('Password1!')).toEqual([]);
  });

  it('should reject a password shorter than 8 characters', async () => {
    expect(await passwordErrors('Pass1!')).toHaveLength(1);
  });

  it('should reject a password longer than 72 characters', async () => {
    expect(await passwordErrors(`Password1!${'a'.repeat(63)}`)).toHaveLength(1);
  });

  it('should reject a password without an uppercase letter', async () => {
    expect(await passwordErrors('password1!')).toEqual([
      'password must contain at least one uppercase letter',
    ]);
  });

  it('should reject a password without a lowercase letter', async () => {
    expect(await passwordErrors('PASSWORD1!')).toEqual([
      'password must contain at least one lowercase letter',
    ]);
  });

  it('should reject a password without a number', async () => {
    expect(await passwordErrors('Password!')).toEqual([
      'password must contain at least one number',
    ]);
  });

  it('should reject a password without a special character', async () => {
    expect(await passwordErrors('Password1')).toEqual([
      'password must contain at least one special character',
    ]);
  });
});
