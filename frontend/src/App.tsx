import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "./components/theme/theme-provider";

import Home from "@pages/Home";
import Auth from "@pages/Auth";
import ChatbotPage from "./pages/ChatbotPage";
import ForgotPassword from "./pages/ForgotPassword";

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
						<Route path="/chatbot" element={<ChatbotPage />} />
					</Routes>
				</Router>
			</ThemeProvider>
		</>
	);
};

export default App;
