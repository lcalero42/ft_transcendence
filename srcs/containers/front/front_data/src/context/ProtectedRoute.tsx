import { useEffect } from "react";
import { useAuth } from "./useAuth";
import {Navigate, useLocation} from "react-router-dom";
import {toast} from "@/components/ui/toast";
import { useTranslation } from "react-i18next";

type ProtectedRouteProps = {
	children: React.ReactNode;
	redirectTo?: string;
	allowGuest?: boolean;
	adminOnly?: boolean;
};

function ProtectedRoute({children, redirectTo = "/login", allowGuest = true, adminOnly = false}: ProtectedRouteProps){
	const {isAuth, isGuest, isAdmin, isLoading, profileLoading} = useAuth();
	const location = useLocation();
	const blockedGuest = !allowGuest && isGuest;
	const waitingForAdmin = adminOnly && profileLoading;
	const { t } = useTranslation();

	useEffect(() => {
		if (isLoading) return;
		if (!isAuth && redirectTo === "/login") {
			toast.add({id: "not-logged-in", type: "warning", title: t("auth.notLogged")})
		} else if (blockedGuest) {
			toast.add({id: "guest-blocked", type: "warning", title: t("auth.guestBlocked")})
		} else if (!waitingForAdmin && isAuth && adminOnly && !isAdmin) {
			toast.add({id: "not-admin", type: "warning", title: t("auth.adminRequired")})
		}
	}, [isLoading, isAuth, blockedGuest, redirectTo, waitingForAdmin, isAdmin, adminOnly, t]);

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
	if (waitingForAdmin) {
		return null
	}
	if (adminOnly && !isAdmin)
		return (<Navigate to="/home" replace />);
	return <> {children} </>
}

export default ProtectedRoute;
