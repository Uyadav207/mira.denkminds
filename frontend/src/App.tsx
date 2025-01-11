import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "./components/theme/theme-provider";

// import Home from "@pages/Home";
import Chatbot from "./pages/Chatbot";
import { Settings } from "./pages/Settings";
import { Layout } from "./components/dashboard/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Reports } from "./pages/Reports";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ProfileSettings from "./pages/ProfileSettings";
import ForgotPassword from "./pages/ForgotPassword";
import PrivacyPolicy from "./pages/privacy";

const App = () => {
	return (
		<>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<Toaster />
				<Router>
					<Routes>
						{/* <Route path="/" element={<Home />} /> */}
						<Route path="/login" element={<Auth />} />
						<Route path="/register" element={<Auth />} />
						<Route
							path="/forgot-password"
							element={<ForgotPassword />}
						/>
						<Route
						    path="/privacy"
						    element={<PrivacyPolicy />}
						/>
						<Route
							path="/auth/callback"
							element={<AuthCallback />}
						/>
						<Route element={<Layout />}>
							<Route
								path="/chatbot/:chatId?"
								element={<Chatbot />}
							/>
							<Route path="/settings" element={<Settings />} />
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/reports" element={<Reports />} />
							<Route
								path="/accounts"
								element={<ProfileSettings />}
							/>
							
							</Route>
					</Routes>
				</Router>
			</ThemeProvider>
		</>
	);
};

export default App;
