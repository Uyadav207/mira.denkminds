import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { ThemeProvider } from "./components/theme/theme-provider";
import { Home } from "./pages/Home";
import ChatbotPage from "./pages/ChatbotPage";


// import { DisplayToaster } from "./components/toaster";

const App = () => {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<Router>
				<Routes>
					{/* <DisplayToaster /> */}
					<Route path="/" element={<Home />} />
					{/* Add more routes here as needed */}
					<Route path="/chatbot" element={<ChatbotPage />} />

				</Routes>
			</Router>
		</ThemeProvider>
	);
};

export default App;
