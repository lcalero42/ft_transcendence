export interface Logger {
	info(message: string): void;
	error(message: string): void;
}

export function createLogger(prefix: string): Logger {
	const safePrefix = prefix.startsWith('[') ? prefix : `[${prefix}]`;

	return {
		info(message: string) {
			console.log(`${safePrefix} ${message}`);
		},
		error(message: string) {
			console.error(`${safePrefix} ${message}`);
		},
	};
}
