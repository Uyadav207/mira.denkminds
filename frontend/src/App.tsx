import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { ThemeProvider } from "./components/theme/theme-provider";
import { Home } from "./pages/Home";

// import { DisplayToaster } from "./components/toaster";

import { SignUp } from "./pages/Signup";
import { Login } from "./pages/Login";
const App = () => {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<Router>
				<Routes>
					{/* <DisplayToaster /> */}
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<SignUp />} />
					{/* Add more routes here as needed */}

				</Routes>
			</Router>
		</ThemeProvider>
	);
};

export default App;
