import type { Context } from "hono";
import { PrismaClient } from "@prisma/client";
import { AuthService } from "../services/authService";
import { JwtService } from "../services/jwtService";

const prisma = new PrismaClient();
const authService = new AuthService(prisma);
const jwtService = new JwtService();

export const register = async (c: Context) => {
	const { firstName, lastName, username, email, password } = await c.req.json();

	try {
		const user = await authService.register(
			firstName,
			lastName,
			username,
			email,
			password,
		);
		const token = jwtService.generateToken(user.id);

		return c.json({ user, token }, 201);
	} catch (error) {
		return c.json({ error: (error as Error).message }, 400);
	}
};

export const login = async (c: Context) => {
	const { email, password } = await c.req.json();

	try {
		const user = await authService.login(email, password);
		const token = jwtService.generateToken(user.id);
		return c.json({ user, token });
	} catch (error) {
		return c.json({ error: (error as Error).message }, 401);
	}
};
