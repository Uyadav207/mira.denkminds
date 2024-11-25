import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { ThemeProvider } from "./components/theme/theme-provider";
import { Home } from "./pages/Home";
const App = () => {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
					{/* Add more routes here as needed */}
				</Routes>
			</Router>
		</ThemeProvider>
	);
};

export default App;
