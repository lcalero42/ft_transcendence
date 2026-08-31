const BASE_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "accessToken";

export function getToken() {
	return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
	localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
	localStorage.removeItem(TOKEN_KEY);
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
		if (res.status === 401) clearToken();
		const msg  = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
		throw new Error(msg ?? `Request failed (${res.status})`);
	}

	return res.status === 204 ? (null as T) : ((await res.json()) as T);
}
