import { useEffect } from "react";
import { useAuth } from "./useAuth";
import {Navigate} from "react-router-dom"
import {toast} from "@/components/ui/toast";

function ProtectedRoute({children}:{children: React.ReactNode}){
	const {isAuth, isLoading} = useAuth();

	useEffect(() => {
		if (!isLoading && !isAuth) {
			toast.add({id: "not-logged-in", type: "warning", title: "you're not logged"})
		}
	}, [isLoading, isAuth]);

	if (isLoading) {
		return null
	}
	if (!isAuth) {
		return (<Navigate to="/login" replace />);
	}
	return <> {children} </>
}

export default ProtectedRoute;
