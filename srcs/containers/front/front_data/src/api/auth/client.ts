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

export async function apiFetch(path:string, options: RequestInit = {}) {
	const token = getToken();
	const res = await fetch(`${BASE_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...options.headers,
		},
	});

	if (!res.ok) {
		const body = await res.json().catch(() => null);
		if (res.status === 401) clearToken();
		throw new Error(body?.message ?? `Request failed (${res.status})`);
	}

	return res.status === 204 ? null : res.json();
}
