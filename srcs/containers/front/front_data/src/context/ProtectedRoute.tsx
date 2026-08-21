import { useAuth } from "./AuthContext";
import {Navigate} from "react-router-dom"

function ProtectedRoute({children}:{children: React.ReactNode}){
	const {isAuth, isLoading} = useAuth();
	if (isLoading) {
		return null
	}
	if (!isAuth) {
		return <Navigate to="/login" replace />;
	}

	return <> {children} </>
}

export default ProtectedRoute;
