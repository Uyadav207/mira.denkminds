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
import { PrintableTemplate } from "./components/PDF/PrintableTemplate";
import { FolderView } from "./components/folder/FolderView";
import { ChatTemplate } from "./components/PDF/Chattemplate";
import { ChatSummaries } from "./components/PDF/ChatSummaries";
// import TemplateContentPage from "./components/PDF/TemplateContentPage";

// const mockFolder = {
// 	id: "folder1",
// 	name: "Sample Folder",
// 	files: [], // Add your mock files here
//   };

//   const handleBack = () => {
// 	console.log("Back to previous view");
//   };
import { FileView } from "./components/file";
import PrivateRoute from "./components/privateRoutes";
import { NotFound } from "./pages/NotFound";
import PrivacyPolicy from "./pages/Privacy";

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
						<Route path="/Privacy" element={<PrivacyPolicy />} />
						<Route
							path="/auth/callback"
							element={<AuthCallback />}
						/>
						{/* <Route
								path="/chatbot/:chatId?"
								element={<Chatbot />}
							/> */}



						{/* <Route path="/template/:templateId" element={<TemplateContentPage />} /> */}

						<Route element={
							<PrivateRoute>

								<Layout />
							</PrivateRoute>
						}
						>
							<Route path="/printtemplate" element={<PrintableTemplate />} />
							<Route path="/chat/:_id" element={<ChatTemplate />} />
							<Route path="/chatbot/:chatId?" element={<Chatbot />} />
							<Route path="chat-summaries" element={<ChatSummaries />} />

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
							<Route
								path="/reports/:reportId?"
								element={<Reports />}
							/>
							<Route
								path="/accounts"
								element={<ProfileSettings />}
							/>
							<Route
								path="/file/:fileId"
								element={<FileView />}
							/>
						</Route>
						<Route path="*" element={<NotFound />} />
					</Routes>
				</Router>
			</ThemeProvider>
		</>
	);
};

export default App;
