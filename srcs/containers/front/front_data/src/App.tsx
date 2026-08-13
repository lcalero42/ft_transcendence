import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Admin from "./pages/Admin/Admin";
import GameRoom from "./pages/GameRoom/GameRoom";
import CreateRoom from "./pages/CreateRoom/CreateRoom";
function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="/home" replace />} />
				<Route path="/home" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/admin" element={<Admin />} />
				<Route path="/create-room" element={<CreateRoom />} />
				<Route path="/game/:id" element={<GameRoom />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App;
