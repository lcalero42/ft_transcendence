import i18n from "@/i18n";

const BASE_URL = import.meta.env.VITE_API_URL;

type AuthMessage = { type: "logout" };

const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("auth") : null;
const loggedOutListeners = new Set<() => void>();

channel?.addEventListener("message", (e: MessageEvent<AuthMessage>) => {
	if (e.data.type === "logout") loggedOutListeners.forEach((cb) => cb());
});

export function notifyLoggedOut() {
	loggedOutListeners.forEach((cb) => cb());
	channel?.postMessage({ type: "logout" } satisfies AuthMessage);
}

export function onLoggedOut(cb: () => void) {
	loggedOutListeners.add(cb);
	return () => {
		loggedOutListeners.delete(cb);
	};
}

interface ErrorBody {
	code?: string;
}

export class ApiError extends Error {
	constructor(message: string, public status: number, public code?: string) {
		super(message);
	}
}

function errorMessage(status: number, code: string | undefined, retryAfter: string | null) {
	if (code && i18n.exists(`errors.api.${code}`)) return i18n.t(`errors.api.${code}`);
	if (status === 429) {
		const seconds = Number(retryAfter);
		return seconds > 0
			? i18n.t("common.tooManyRequestsRetry", { count: Math.ceil(seconds) })
			: i18n.t("common.tooManyRequests");
	}
	if (status >= 500) return i18n.t("errors.status.server");
	if (i18n.exists(`errors.status.${status}`)) return i18n.t(`errors.status.${status}`);
	return i18n.t("common.somethingWentWrong");
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
	const isFormData = options.body instanceof FormData;
	const res = await fetch(`${BASE_URL}${path}`, {
		...options,
		headers: {
			...(isFormData ? {} : {"Content-Type": "application/json"}),
			...options.headers,
		},
	});

	if (!res.ok) {
		const body = (await res.json().catch(() => null)) as ErrorBody | null;
		if (res.status === 401) loggedOutListeners.forEach((cb) => cb());
		const code = typeof body?.code === "string" ? body.code : undefined;
		throw new ApiError(errorMessage(res.status, code, res.headers.get("Retry-After")), res.status, code);
	}

	return res.status === 204 ? (null as T) : ((await res.json()) as T);
}
