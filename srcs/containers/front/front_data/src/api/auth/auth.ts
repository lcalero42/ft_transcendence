import { apiFetch, notifyLoggedOut } from "./client";

export interface SessionUser {
	id: number;
	email: string | null;
}

export function login(email: string, password: string, rememberMe: boolean) {
	return apiFetch<SessionUser>("/auth/login", {
		method: "POST",
		body: JSON.stringify({email, password, rememberMe}),
	});
}

export function register(email:string, password:string, name:string) {
	return apiFetch<SessionUser>("/auth/register", {
		method: "POST",
		body: JSON.stringify({email,password,name}),
	});
}

export function guest(name: string) {
	return apiFetch<SessionUser>("/auth/guest", {
		method: "POST",
		body: JSON.stringify({name}),
	});
}

export async function logout() {
	await apiFetch("/auth/logout", { method: "POST" }).catch(() => null);
	notifyLoggedOut();
}
