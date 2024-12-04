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
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<SignUp />} />
						<Route path="/chatbot" element={<ChatbotPage />} />
					</Routes>
				</Router>
			</ThemeProvider>
		</>
	);
};

export default App;
