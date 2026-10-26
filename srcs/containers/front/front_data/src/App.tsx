import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Privacy from "./pages/Privacy/Privacy";
import Guest from "./pages/Guest/Guest";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Admin from "./pages/Admin/Admin";
import GameRoom from "./pages/GameRoom/GameRoom";
import CreateRoom from "./pages/CreateRoom/CreateRoom";
import NotFound from "./pages/NotFound/NotFound";
import OAuthCallback from "./pages/OAuthCallback/OAuthCallback";
import { AuthProvider } from "./context/AuthContext";
import { FriendsProvider } from "./context/FriendsContext";
import ProtectedRoute from "./context/ProtectedRoute";
import Layout from "./components/Layout/Layout";
import { Toaster} from "@/components/ui/toast";

function App() {
	return (
		<AuthProvider>
			<FriendsProvider>
				<BrowserRouter>
					<Toaster />
					<Layout>
						<Routes>
							<Route path="/" element={<Navigate to="/home" replace />} />
							<Route path="/home" element={<Home />} />
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
							<Route path="/guest" element={<Guest />} />
							<Route path="/auth/callback" element={<OAuthCallback />} />
							<Route path="/admin" element={<ProtectedRoute allowGuest={false} adminOnly><Admin /></ProtectedRoute>} />
							<Route path="/profile" element={<ProtectedRoute allowGuest={false}><Profile /></ProtectedRoute>} />
							<Route path="/profile/:name" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/privacy" element={<Privacy />} />
							<Route path="/create-room/:roomId?" element={<ProtectedRoute redirectTo="/guest"><CreateRoom /></ProtectedRoute>} />
							<Route path="/game/:id" element={<ProtectedRoute redirectTo="/guest"><GameRoom /></ProtectedRoute>} />
							<Route path="*" element={<NotFound />} />
						</Routes>
					</Layout>
				</BrowserRouter>
			</FriendsProvider>
		</AuthProvider>
	)
}

export default App;
