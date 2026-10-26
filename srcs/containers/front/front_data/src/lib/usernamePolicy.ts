export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 24;
const USERNAME_CHARSET = /^[A-Za-z0-9_-]+$/;

export function usernameErrorKey(username: string): string | undefined {
	if (!username) return "auth.errors.usernameRequired";
	if (username.length < USERNAME_MIN_LENGTH) return "auth.errors.usernameTooShort";
	if (username.length > USERNAME_MAX_LENGTH) return "auth.errors.usernameTooLong";
	if (!USERNAME_CHARSET.test(username)) return "auth.errors.usernameInvalid";
	return undefined;
}
