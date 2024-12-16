import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import useStore from "../store/store";
import { authApis } from "../api/auth";
import DynamicForm from "@components/inputs/dynamic-form";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import AuthByProviders from "@components/inputs/auth-providers";

import { loginFields, registerFields } from "../constants/authFields";
import type {
	LoginApiPayloadType,
	RegisterApiPayloadType,
} from "../types/auth";
import { createLoginResponseBody } from "../utils/auth-helper";

const Auth: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const formType = location.pathname === "/login" ? "login" : "register";

	const { setToken, setUser } = useStore();
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (
		data: LoginApiPayloadType | RegisterApiPayloadType,
	) => {
		try {
			setIsLoading(true);

			// Type narrowing based on the form type
			if (formType === "login") {
				const loginData = createLoginResponseBody(data as LoginApiPayloadType);
				const response = await authApis.login(loginData);
				const result = response.data;
				setToken(result.token);
				setUser(result.user);
			} else {
				const registerData = data as RegisterApiPayloadType;
				const response = await authApis.register(registerData);
				const result = response.data;
				setToken(result.token);
				setUser(result.user);
			}

			navigate("/chatbot");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
			<Card className="w-full max-w-[400px]">
				<CardHeader>
					<CardTitle className="text-2xl font-semibold text-center">
						{formType === "login" ? "Welcome back" : "Create an account"}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<AuthByProviders type={formType} />

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<Separator />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or continue with
							</span>
						</div>
					</div>

					<DynamicForm
						fields={formType === "login" ? loginFields : registerFields}
						onSubmit={handleSubmit}
						submitButton={{
							displayName: formType === "login" ? "Login" : "Create account",
							disabled: isLoading,
						}}
					/>

					{formType === "login" && (
						<p className="text-left text-sm text-muted-foreground">
							<Link
								to="/forgot-password"
								className="underline underline-offset-4 hover:text-primary"
							>
								Forgot Password
							</Link>
						</p>
					)}
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<p className="text-sm text-muted-foreground text-center">
						By continuing, you agree to denkMind's{" "}
						<Link
							to="/terms"
							className="underline underline-offset-4 hover:text-primary"
						>
							Terms of Service
						</Link>
						. Read our{" "}
						<Link
							to="/privacy"
							className="underline underline-offset-4 hover:text-primary"
						>
							Privacy Policy
						</Link>
						.
					</p>
					<p className="text-center text-sm text-muted-foreground">
						{formType === "login"
							? "Don't have an account?"
							: "Already have an account?"}{" "}
						<Link
							to={formType === "login" ? "/register" : "/login"}
							className="underline underline-offset-4 hover:text-primary"
						>
							{formType === "login" ? "Register" : "Log in"}
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Auth;
