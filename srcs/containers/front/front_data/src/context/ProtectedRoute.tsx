import { useEffect } from "react";
import { useAuth } from "./useAuth";
import {Navigate} from "react-router-dom";
import {toast} from "@/components/ui/toast";

function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { isAuth, isAdmin, isLoading } = useAuth();
	useEffect(() => {
		if (!isLoading && !isAuth) {
			toast.add({id: "not-logged-in", type: "warning", title: "You're not logged"})
		}
		else if (!isLoading && isAuth && adminOnly && !isAdmin) {
			toast.add({id: "not-admin", type: "warning", title: "Admin access required"})
		}
	}, [isLoading, isAuth, isAdmin, adminOnly]);

	if (isLoading) {
		return null
	}
	if (!isAuth) {
		return (<Navigate to="/login" replace />);
	}
	if (adminOnly && !isAdmin)
		return (<Navigate to="/home" replace />);
	return <> {children} </>
}

export default ProtectedRoute;
