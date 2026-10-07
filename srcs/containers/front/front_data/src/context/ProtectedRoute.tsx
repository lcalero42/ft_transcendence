import { useEffect } from "react";
import { useAuth } from "./useAuth";
import {Navigate} from "react-router-dom"
import {toast} from "@/components/ui/toast";
import { useTranslation } from "react-i18next";

function ProtectedRoute({children}:{children: React.ReactNode}){
	const {isAuth, isLoading} = useAuth();
	const { t } = useTranslation();

	useEffect(() => {
		if (!isLoading && !isAuth) {
			toast.add({id: "not-logged-in", type: "warning", title: t("auth.notLogged")})
		}
	}, [isLoading, isAuth, t]);

	if (isLoading) {
		return null
	}
	if (!isAuth) {
		return (<Navigate to="/login" replace />);
	}
	return <> {children} </>
}

export default ProtectedRoute;
