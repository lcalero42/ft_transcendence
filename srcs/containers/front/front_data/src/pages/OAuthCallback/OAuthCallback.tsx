import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function OAuthCallback() {
	const navigate = useNavigate();

	useEffect(() => {
		void navigate("/home", { replace: true });
	}, [navigate]);

	return null;
}

export default OAuthCallback;
