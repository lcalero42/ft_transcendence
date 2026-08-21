import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import GameRoom from "./pages/GameRoom/GameRoom";
import CreateRoom from "./pages/CreateRoom/CreateRoom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Navigate to="/home" replace />} />
					<Route path="/home" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />


					<Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
					<Route path="/create-room" element={<ProtectedRoute><CreateRoom /></ProtectedRoute>} />
					<Route path="/game/:id" element={<ProtectedRoute><GameRoom /></ProtectedRoute>} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	)
}

export default App;
