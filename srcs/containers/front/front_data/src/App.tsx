import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Guest from "./pages/Guest/Guest";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Admin from "./pages/Admin/Admin";
import GameRoom from "./pages/GameRoom/GameRoom";
import CreateRoom from "./pages/CreateRoom/CreateRoom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";
import { Toaster} from "@/components/ui/toast";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Toaster />
				<Routes>
					<Route path="/" element={<Navigate to="/home" replace />} />
					<Route path="/home" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/guest" element={<Guest />} />

					<Route path="/admin" element={<ProtectedRoute allowGuest={false}><Admin /></ProtectedRoute>} />

					<Route path="/profile" element={<ProtectedRoute allowGuest={false}><Profile /></ProtectedRoute>} />
					<Route path="/create-room/:roomId?" element={<ProtectedRoute redirectTo="/guest"><CreateRoom /></ProtectedRoute>} />
					<Route path="/game/:id" element={<ProtectedRoute redirectTo="/guest"><GameRoom /></ProtectedRoute>} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	)
}

export default App;
