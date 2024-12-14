import type { PrismaClient } from "@prisma/client";
import { hashPassword, comparePasswords } from "../utils/passwordUtils";

export class AuthService {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	// Registers a new user (email/password or Google OAuth)

	async register(
		firstName: string,
		lastName: string,
		username: string,
		email: string,
		password?: string, // Optional for OAuth
		authProvider: "email" | "google" = "email", // Default to email registration
		supabaseId?: string, // Optional for Google users
	) {
		// Check if email or username already exists
		const existingUser = await this.prisma.user.findFirst({
			where: {
				OR: [{ email }, { username }],
			},
		});

		if (existingUser) {
			if (existingUser.email === email) {
				throw new Error("Email already exists");
			}
			if (existingUser.username === username) {
				throw new Error("Username already exists");
			}
		}

		let hashedPassword = null;

		// Handle password for email users
		if (authProvider === "email") {
			if (!password) {
				throw new Error("Password is required for email registration");
			}
			hashedPassword = await hashPassword(password);
		}

		// Create user
		return this.prisma.user.create({
			data: {
				firstName,
				lastName,
				username,
				email,
				password: hashedPassword,
				authProvider,
				supabaseId,
			},
		});
	}

	// Logs in a user with email/password

	async login(email: string, password: string) {
		const user = await this.prisma.user.findUnique({
			where: { email },
		});
		if (!user) {
			throw new Error("Invalid credentials");
		}

		// Check if the user is an email/password user
		if (user.authProvider === "google") {
			throw new Error("Please log in using Google");
		}

		if (!user.password) {
			throw new Error("Password is required for login with email");
		}

		// Validate password
		const isPasswordValid = await comparePasswords(password, user.password);
		if (!isPasswordValid) {
			throw new Error("Invalid credentials");
		}

		return user;
	}

	// Synchronizes Google OAuth users with the database

	async syncGoogleUser(
		supabaseId: string,
		email: string,
		firstName: string,
		lastName: string,
		username: string,
		avatar?: string,
	) {
		// Upsert the Google user
		const user = await this.prisma.user.upsert({
			where: { supabaseId },
			update: {
				email,
				firstName,
				lastName,
				username,
				avatar,
			},
			create: {
				supabaseId,
				email,
				firstName,
				lastName,
				username,
				avatar,
				authProvider: "google",
			},
		});

		return user;
	}
}
