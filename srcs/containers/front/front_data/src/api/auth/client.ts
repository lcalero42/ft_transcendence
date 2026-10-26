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
	message?: string | string[];
	code?: string;
}

function tooManyRequestsMessage(body: ErrorBody | null, retryAfter: string | null) {
	if (body?.code === "FRIEND_REQUEST_COOLDOWN") return i18n.t("friends.errRequestCooldown");
	const seconds = Number(retryAfter);
	return seconds > 0
		? i18n.t("common.tooManyRequestsRetry", { count: Math.ceil(seconds) })
		: i18n.t("common.tooManyRequests");
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
		if (res.status === 429) throw new Error(tooManyRequestsMessage(body, res.headers.get("Retry-After")));
		const msg  = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
		throw new Error(msg ?? `Request failed (${res.status})`);
	}

	return res.status === 204 ? (null as T) : ((await res.json()) as T);
}
