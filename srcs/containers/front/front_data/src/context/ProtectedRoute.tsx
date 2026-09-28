import { useEffect } from "react";
import { useAuth } from "./useAuth";
import {Navigate, useLocation} from "react-router-dom"
import {toast} from "@/components/ui/toast";

type ProtectedRouteProps = {
	children: React.ReactNode;
	redirectTo?: string;
	allowGuest?: boolean;
};

function ProtectedRoute({children, redirectTo = "/login", allowGuest = true}: ProtectedRouteProps){
	const {isAuth, isGuest, isLoading, profileLoading} = useAuth();
	const location = useLocation();
	const blockedGuest = !allowGuest && isGuest;

	useEffect(() => {
		if (isLoading) return;
		if (!isAuth && redirectTo === "/login") {
			toast.add({id: "not-logged-in", type: "warning", title: "you're not logged"})
		} else if (blockedGuest) {
			toast.add({id: "guest-blocked", type: "warning", title: "create an account to access this page"})
		}
	}, [isLoading, isAuth, blockedGuest, redirectTo]);

	if (isLoading) {
		return null
	}
	if (!isAuth) {
		return (<Navigate to={redirectTo} replace state={{ from: location.pathname }} />);
	}
	if (!allowGuest && profileLoading) {
		return null
	}
	if (blockedGuest) {
		return (<Navigate to="/login" replace />);
	}
	return <> {children} </>
}

export default ProtectedRoute;
