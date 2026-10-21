import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function OAuthCallback() {
	const { loginWithToken } = useAuth();
	const navigate = useNavigate();
	const handled = useRef(false);

	useEffect(() => {
		if (handled.current) return;
		handled.current = true;

		const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
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
