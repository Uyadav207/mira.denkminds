import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "./components/theme/theme-provider";

import Chatbot from "./pages/Chatbot";
import { Settings } from "./pages/Settings";
import { Layout } from "./components/dashboard/Layout";
import { Reports } from "./pages/Reports";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ProfileSettings from "./pages/ProfileSettings";
import ForgotPassword from "./pages/ForgotPassword";
import { RecentScans } from "./pages/scans/RecentScans";
import { ApiScans } from "./pages/scans/ApiScans";
import Vulnerabilities from "./pages/scans/vulnerabilities/vulnerabilities";
import Urls from "./pages/scans/VulnerableUrls/Urls";

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
						<Route path="/forgot-password" element={<ForgotPassword />} />
						<Route path="/auth/callback" element={<AuthCallback />} />
						<Route element={<Layout />}>
							<Route path="/chatbot/:chatId?" element={<Chatbot />} />
							<Route path="/settings" element={<Settings />} />
							<Route path="/recent-scan" element={<RecentScans />} />
							<Route
								path="/recent-scan/:scanId/"
								element={<Vulnerabilities />}
							/>
							<Route
								path="/recent-scan/:scanId/vulnerability/:vulnerabilityId/"
								element={<Urls />}
							/>
							<Route path="/api-scan" element={<ApiScans />} />
							<Route path="/reports" element={<Reports />} />
							<Route path="/accounts" element={<ProfileSettings />} />
						</Route>
					</Routes>
				</Router>
			</ThemeProvider>
		</>
	);
};

export default App;
