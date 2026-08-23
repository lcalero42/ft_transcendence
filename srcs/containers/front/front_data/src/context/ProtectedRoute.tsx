import { useAuth } from "./useAuth";
import {Navigate} from "react-router-dom"
import {toast} from "@/components/ui/toast";

function ProtectedRoute({children}:{children: React.ReactNode}){
	const {isAuth, isLoading} = useAuth();
	if (isLoading) {
		return null
	}
	if (!isAuth) {
		toast.add({title: "you're not logged"})
		return (<Navigate to="/login" replace />);
	}
	return <> {children} </>
}

export default ProtectedRoute;
