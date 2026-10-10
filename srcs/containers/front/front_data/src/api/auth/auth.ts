import { apiFetch, setToken, clearToken } from "./client";

export interface AuthResponse {
	accessToken: string;
}

export async function login(email: string, password: string) {
	const data = await apiFetch<AuthResponse>("/auth/login", {
		method: "POST",
		body: JSON.stringify({email, password}),
	});
	setToken(data.accessToken);
	return data;
}

export async function register(email:string, password:string, name:string) {
	const data = await apiFetch<AuthResponse>("/auth/register", {
		method: "POST",
		body: JSON.stringify({email,password,name}),
	});
	setToken(data.accessToken);
	return data;
}

export async function guest(name: string) {
	const data = await apiFetch<AuthResponse>("/auth/guest", {
		method: "POST",
		body: JSON.stringify({name}),
	});
	setToken(data.accessToken);
	return data;
}

export function logout() {
	clearToken();
}
