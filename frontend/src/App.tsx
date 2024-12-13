import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "./components/theme/theme-provider";

import ChatbotPage from "./pages/ChatbotPage";

import SignUp from "@pages/Signup";
import Login from "@pages/Login";
import Home from "@pages/Home";

const App = () => {
	return (
		<>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<Toaster />
				<Router>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Auth />} />
						<Route path="/register" element={<Auth />} />
						<Route path="/forgot-password" element={<ForgotPassword />} />
						<Route element={<Layout />}>
							<Route path="/chatbot" element={<Chatbot />} />
							<Route path="/settings" element={<Settings />} />
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/reports" element={<Reports />} />
						</Route>
					</Routes>
				</Router>
			</ThemeProvider>
		</>
	);
};

export default App;
