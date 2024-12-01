import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "../components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { type SignUpValues, signUpSchema } from "../lib/validations/auth";
import { signup } from "../services/auth";
import useStore from "../store/store";

export function SignUp() {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const setToken = useStore((state) => state.setToken);
	const setUser = useStore((state) => state.setUser);

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
			const result = await signup(
				data.firstName,
				data.lastName,
				data.username,
				data.email,
				data.password,
			);
			setToken(result.token);
			setUser(result.user);
			navigate("/");
		} catch (error) {
			console.error("Authentication error:", error);
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
		<div className="container relative flex min-h-screen flex-col items-center justify-center px-4 py-8 md:px-0">
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
						<svg
							className="mr-2 h-4 w-4"
							viewBox="0 0 24 24"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Google</title>

							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Google
					</Button>
					<Button
						variant="outline"
						disabled={isLoading}
						onClick={signInWithApple}
						className="w-full"
					>
						<svg
							className="mr-2 h-4 w-4"
							fill="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Apple</title>
							
							<path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
						</svg>
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
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input placeholder="First name" {...field} />
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
											<Input placeholder="Last name" {...field} />
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
										<Input placeholder="Username" {...field} />
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
										<Input placeholder="Email" type="email" {...field} />
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
												type={showPassword ? "text" : "password"}
												{...field}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowPassword(!showPassword)}
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
						{/* <FormField
							control={form.control}
							name="terms"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>
											I agree to the{" "}
											<Link
												to="/terms"
												className="underline underline-offset-4 hover:text-primary"
											>
												Terms & Conditions
											</Link>
										</FormLabel>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/> */}
						<Button type="submit" className="w-full" disabled={isLoading}>
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
}

