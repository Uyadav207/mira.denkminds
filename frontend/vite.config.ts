import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const BASE_URL = env.VITE_BASE_URL || "/";

	return {
		base: BASE_URL,
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
		define: {
			"process.env": env,
		},
	};
});
