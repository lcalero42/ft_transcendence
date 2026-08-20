import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getToken } from "../api/auth/client";
import * as authApi from "../api/auth/auth"; // ca fou tt dans un obj grave cool

interface User {
	id: number;
	email: string;
}

interface AuthContextValue {
	user : User | null;
	isAuth: boolean;
	isLoading: boolean;
	login: (email:string, password:string) => Promise<void>;
	register: (email:string, password:string, name:string) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
function decodeToken(token: string): User | null {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
   		return { id: payload.sub, email: payload.email };
	} catch {
		return null;
	}
}

export function AuthProvider({children}:{children: ReactNode}) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const token = getToken();
		if (token)
			setUser(decodeToken(token));
		setIsLoading(false);
	}, []);
	async function login(email:string, pw:string) {
		const { accessToken } = await authApi.login(email,pw);
		setUser(decodeToken(accessToken));
	}
	async function register(email:string, pw:string, name:string) {
		const { accessToken } = await authApi.register(email,pw,name);
		setUser(decodeToken(accessToken));
	}
	function logout() {
		authApi.logout();
		setUser(null);
	}
	return (
		<AuthContext.Provider value={{user,isAuth:!!user, isLoading, login,register,logout}}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context)
		throw new Error("UseAuth must be used within AuthProvider");
	return context;
}
