import type { Context } from "hono";
import { PrismaClient } from "@prisma/client";
import { AuthService } from "../services/authService";
import { JwtService } from "../services/jwtService";
import type User from "../models/User";

const prisma = new PrismaClient();
const authService = new AuthService(prisma);
const jwtService = new JwtService();

//  Registers a new user (handles both email/password and Google OAuth users)

export const register = async (c: Context) => {
	const {
		firstName,
		lastName,
		username,
		email,
		password,
		authProvider,
		supabaseId,
		avatar,
	} = await c.req.json();

	try {
		const user = await authService.register(
			firstName,
			lastName,
			username,
			email,
			password,
			authProvider || "email", // Default to email if not provided
			supabaseId,
		);
		const token = jwtService.generateToken(user);

		return c.json({ user, token }, 201);
	} catch (error) {
		return c.json({ error: (error as Error).message }, 400);
	}
};

// Logs in a user (handles both email/password and Google OAuth login)

export const login = async (c: Context) => {
	const {
		authProvider,
		email,
		password,
		supabaseId,
		firstName,
		lastName,
		username,
		avatar,
	} = await c.req.json();

	try {
		let user: User;

		if (authProvider === "google") {
			if (!supabaseId) {
				throw new Error("Google user must provide a valid supabaseId");
			}

			// Sync or fetch Google user
			user = await authService.syncGoogleUser(
				supabaseId,
				email,
				firstName,
				lastName,
				username,
				avatar,
			);
		} else if (authProvider === "email") {
			if (!password) {
				throw new Error("Password is required for email login");
			}

			// Authenticate email/password user
			user = await authService.login(email, password);
		} else {
			throw new Error("Invalid auth provider");
		}

		// Generate JWT token
		const token = jwtService.generateToken(user);
		return c.json({ user, token });
	} catch (error) {
		return c.json({ error: (error as Error).message }, 401);
	}
};
