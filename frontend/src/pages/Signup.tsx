import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

//types
import type { AuthResponse } from "../types/auth";
import { type SignUpValues, signUpSchema } from "../lib/validations/auth";

//store
import useStore from "@store/store";

//api
import { authApis } from "@api/auth";

//icons
import GoogleIcon from "../assets/GoogleIcon.svg";
import AppleIcon from "../assets/AppleIcon.svg";
import { Eye, EyeOff } from "lucide-react";

//components
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Separator } from "@components/ui/separator";
import { showErrorToast } from "@components/toaster";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "../components/ui/form";

const SignUp = () => {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { setToken, setUser } = useStore();

	const form = useForm<SignUpValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			username: "",
			email: "",
			password: "",
			// terms: false,
		},
	});

	async function onSubmit(data: SignUpValues) {
		setIsLoading(true);
		try {
			const response = await authApis.signUp(data);
			const result: AuthResponse = response.data;
			setToken(result.token);
			setUser(result.user);
			navigate("/");
		} catch (error: unknown) {
			if (error instanceof Error) {
				showErrorToast(`An error occurred: ${error.message}`);
			} else {
				showErrorToast("An unknown error occurred.");
			}
		} finally {
			setIsLoading(false);
		}
	}

	const signInWithGoogle = async () => {
		setIsLoading(true);
		// Implement Google sign-in
		setIsLoading(false);
	};

	const signInWithApple = async () => {
		setIsLoading(true);
		// Implement Apple sign-in
		setIsLoading(false);
	};

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 md:px-0">
			<div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Create an account
					</h1>
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Button
						variant="outline"
						disabled={isLoading}
						onClick={signInWithGoogle}
						className="w-full"
					>
						<img
							src={GoogleIcon}
							alt="Google Icon"
							className="h-4 w-4"
						/>
						Google
					</Button>
					<Button
						variant="outline"
						disabled={isLoading}
						onClick={signInWithApple}
						className="w-full"
					>
						<img
							src={AppleIcon}
							alt="Apple Icon"
							className="h-4 w-4"
						/>
						Apple
					</Button>
				</div>
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<Separator />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							Or register with
						</span>
					</div>
				</div>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												placeholder="First name"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												placeholder="Last name"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="Username"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="Email"
											type="email"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<div className="relative">
											<Input
												placeholder="Password"
												type={
													showPassword
														? "text"
														: "password"
												}
												{...field}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() =>
													setShowPassword(
														!showPassword,
													)
												}
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							Create account
						</Button>
					</form>
				</Form>

				<p className="text-sm text-muted-foreground">
					By continuing, you agree to Jasper's&nbsp;
					<Link
						to="/terms"
						className="underline underline-offset-4 hover:text-primary"
					>
						Terms of Service
					</Link>
					. Read our&nbsp;
					<Link
						to="/privacy"
						className="underline underline-offset-4 hover:text-primary"
					>
						Privacy Policy
					</Link>
					.
				</p>

				<p className="text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link
						to="/login"
						className="underline underline-offset-4 hover:text-primary"
					>
						Log in
					</Link>
				</p>
			</div>
		</div>
	);
};
export default SignUp;
