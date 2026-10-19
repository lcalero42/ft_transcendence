import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

// The backend redirects here with /auth/callback#token=<jwt>.
function OAuthCallback() {
	const { loginWithToken } = useAuth();
	const navigate = useNavigate();
	// Run once: StrictMode runs effects twice in dev, and loginWithToken
	// re-renders the context, which would otherwise re-trigger the effect.
	const handled = useRef(false);

	useEffect(() => {
		if (handled.current) return;
		handled.current = true;

		const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
		// Remove the token from the address bar and the browser history.
		window.history.replaceState(null, "", window.location.pathname);

		if (!token) {
			void navigate("/login?error=oauth", { replace: true });
			return;
		}
		loginWithToken(token);
		void navigate("/home", { replace: true });
	}, [loginWithToken, navigate]);

	return null;
}

export default OAuthCallback;
