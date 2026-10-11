export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

type PasswordRule = {
	errorKey: string;
	test: (password: string) => boolean;
};

const PASSWORD_RULES: PasswordRule[] = [
	{ errorKey: "auth.errors.passwordTooShort", test: (password) => password.length >= PASSWORD_MIN_LENGTH },
	{ errorKey: "auth.errors.passwordTooLong", test: (password) => password.length <= PASSWORD_MAX_LENGTH },
	{ errorKey: "auth.errors.passwordNoUppercase", test: (password) => /[A-Z]/.test(password) },
	{ errorKey: "auth.errors.passwordNoLowercase", test: (password) => /[a-z]/.test(password) },
	{ errorKey: "auth.errors.passwordNoNumber", test: (password) => /[0-9]/.test(password) },
	{ errorKey: "auth.errors.passwordNoSpecial", test: (password) => /[^A-Za-z0-9]/.test(password) },
];

export function firstPasswordError(password: string): string | null {
	return PASSWORD_RULES.find((rule) => !rule.test(password))?.errorKey ?? null;
}
