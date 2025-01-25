import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	// Load the appropriate .env file
	const env = loadEnv(mode, process.cwd(), "");

	return {
		base: "/", // The base path; typically "/" for most Vercel setups
		plugins: [react()],
		resolve: {
			alias: {
				"@": "/src",
				"@components": "/src/components",
				"@api": "/src/api",
				"@lib": "/src/lib",
				"@store": "/src/store",
				"@pages": "/src/pages",
				"@types": "/src/types",
				"@hooks": "/src/hooks",
			},
		},
		server: {
			port: 3000,
			fs: {
				allow: [".."],
			},
		},
		build: {
			outDir: "dist", // Output directory for production builds
		},
		define: {
			"process.env": {}, // Avoid exposing all process.env variables
			__VITE_BACKEND_BASE_URL__: JSON.stringify(env.VITE_BACKEND_BASE_URL), // Expose your backend base URL
			__VITE_CONVEX_URL__: JSON.stringify(env.VITE_CONVEX_URL), // Expose Convex Cloud URL
		},
	};
});
