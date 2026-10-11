import { COMMON_PASSWORD_BASES } from "./commonPasswords";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
const IDENTITY_MIN_LENGTH = 3;

const LEET_LETTERS: Record<string, string> = {
	"@": "a",
	"4": "a",
	"0": "o",
	"1": "i",
	"!": "i",
	"3": "e",
	$: "s",
	"5": "s",
	"7": "t",
};

type PasswordOwner = {
	username: string;
	email: string;
};

type PasswordRule = {
	errorKey: string;
	test: (password: string, owner: PasswordOwner) => boolean;
};

function isCommonPassword(password: string) {
	const base = password
		.toLowerCase()
		.replace(/^[^a-z@$]+|[^a-z]+$/g, "")
		.replace(/[@401!3$57]/g, (character) => LEET_LETTERS[character])
		.replace(/[^a-z]/g, "");
	return COMMON_PASSWORD_BASES.has(base);
}

function passwordContainsIdentity(password: string, { username, email }: PasswordOwner) {
	const loweredPassword = password.toLowerCase();
	return [username, email.split("@")[0]]
		.map((fragment) => fragment.trim().toLowerCase())
		.some((fragment) => fragment.length >= IDENTITY_MIN_LENGTH && loweredPassword.includes(fragment));
}

const PASSWORD_RULES: PasswordRule[] = [
	{ errorKey: "auth.errors.passwordTooShort", test: (password) => password.length >= PASSWORD_MIN_LENGTH },
	{ errorKey: "auth.errors.passwordTooLong", test: (password) => password.length <= PASSWORD_MAX_LENGTH },
	{ errorKey: "auth.errors.passwordNoUppercase", test: (password) => /[A-Z]/.test(password) },
	{ errorKey: "auth.errors.passwordNoLowercase", test: (password) => /[a-z]/.test(password) },
	{ errorKey: "auth.errors.passwordNoNumber", test: (password) => /[0-9]/.test(password) },
	{ errorKey: "auth.errors.passwordNoSpecial", test: (password) => /[^A-Za-z0-9]/.test(password) },
	{ errorKey: "auth.errors.passwordTooCommon", test: (password) => !isCommonPassword(password) },
	{ errorKey: "auth.errors.passwordContainsIdentity", test: (password, owner) => !passwordContainsIdentity(password, owner) },
];

export function firstPasswordError(password: string, owner: PasswordOwner): string | null {
	return PASSWORD_RULES.find((rule) => !rule.test(password, owner))?.errorKey ?? null;
}
