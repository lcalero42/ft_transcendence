import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import GameRoom from "./pages/GameRoom/GameRoom";
import CreateRoom from "./pages/CreateRoom/CreateRoom";
function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="/home" replace />} />
				<Route path="/home" element={<Home />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/create-room" element={<CreateRoom />} />
				<Route path="/game/:id" element={<GameRoom />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App;
