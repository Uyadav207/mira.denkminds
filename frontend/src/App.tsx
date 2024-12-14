import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "./components/theme/theme-provider";
import SignUp from "@pages/Signup";
import Login from "@pages/Login";
import Home from "@pages/Home";
import Chatbot from "./pages/Chatbot";
import { Settings } from "./pages/Settings";
import { Layout } from "./components/dashboard/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Reports } from "./pages/Reports";
import ProfileSettings from "./pages/ProfileSettings";

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
						<Route element={<Layout />}>
							<Route path="/chatbot" element={<Chatbot />} />
							<Route path="/settings" element={<Settings />} />
							<Route path="/dashboard" element={<Dashboard />} />
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
