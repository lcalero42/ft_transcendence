const BASE_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "accessToken";

type AuthMessage =
	| { type: "request" }
	| { type: "token"; token: string }
	| { type: "logout" };

const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("auth") : null;
const clearedListeners = new Set<() => void>();

channel?.addEventListener("message", (e: MessageEvent<AuthMessage>) => {
	if (e.data.type === "request") {
		const token = sessionStorage.getItem(TOKEN_KEY);
		if (token) channel.postMessage({ type: "token", token } satisfies AuthMessage);
	} else if (e.data.type === "logout") {
		sessionStorage.removeItem(TOKEN_KEY);
		clearedListeners.forEach((cb) => cb());
	}
});

export function getToken() {
	return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, remember = true) {
	sessionStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(TOKEN_KEY);
	(remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
}

export function clearToken() {
	sessionStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(TOKEN_KEY);
	channel?.postMessage({ type: "logout" } satisfies AuthMessage);
}

export function onTokenCleared(cb: () => void) {
	clearedListeners.add(cb);
	return () => {
		clearedListeners.delete(cb);
	};
}

export function requestSessionToken(timeoutMs = 200): Promise<string | null> {
	const ch = channel;
	if (!ch) return Promise.resolve(null);
	return new Promise((resolve) => {
		const finish = (token: string | null) => {
			clearTimeout(timer);
			ch.removeEventListener("message", onMessage);
			if (token) sessionStorage.setItem(TOKEN_KEY, token);
			resolve(token);
		};
		const onMessage = (e: MessageEvent<AuthMessage>) => {
			if (e.data.type === "token") finish(e.data.token);
		};
		const timer = setTimeout(() => finish(null), timeoutMs);
		ch.addEventListener("message", onMessage);
		ch.postMessage({ type: "request" } satisfies AuthMessage);
	});
}

interface ErrorBody {
	message?: string | string[];
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
	const token = getToken();
	const isFormData = options.body instanceof FormData;
	const res = await fetch(`${BASE_URL}${path}`, {
		...options,
		headers: {
			...(isFormData ? {} : {"Content-Type": "application/json"}),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...options.headers,
		},
	});

	if (!res.ok) {
		const body = (await res.json().catch(() => null)) as ErrorBody | null;
		if (res.status === 401 && token) clearToken();
		const msg  = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
		throw new Error(msg ?? `Request failed (${res.status})`);
	}

	return res.status === 204 ? (null as T) : ((await res.json()) as T);
}
