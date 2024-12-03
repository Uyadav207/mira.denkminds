import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import SignUp from "@pages/Signup";
import Login from "@pages/Login";
import Home from "@pages/Home";

import { ThemeProvider } from "@components/theme/theme-provider";

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
						{/* Add more routes here as needed */}
					</Routes>
				</Router>
			</ThemeProvider>
		</>
	);
};

export default App;
