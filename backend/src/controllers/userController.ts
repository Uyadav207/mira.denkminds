import type { Context } from "hono";
import { PrismaClient } from "@prisma/client";
import { UserService } from "../services/userService";

const prisma = new PrismaClient();
const userService = new UserService(prisma);

export const getUserById = async (c: Context) => {
	const id = c.req.param("id");
	try {
		const user = await userService.getUserById(Number(id));
		return c.json(user);
	} catch (error) {
		return c.json({ error: (error as Error).message }, 404);
	}
};

export const updateUserById = async (c: Context) => {
	const id = c.req.param("id");
	const data = await c.req.json();
	try {
		const user = await userService.updateUserById(Number(id), data);
		return c.json(user);
	} catch (error) {
		return c.json({ error: (error as Error).message }, 404);
	}
};

export const deleteUserById = async (c: Context) => {
	const id = c.req.param("id");
	try {
		await userService.deleteUserById(Number(id));
		return c.json({ message: "User deleted successfully" });
	} catch (error) {
		return c.json({ error: (error as Error).message }, 404);
	}
};
