import type { Context } from "hono";
import { PrismaClient } from "@prisma/client";
import { UserService } from "../services/userService";
import { comparePasswords, hashPassword } from "../utils/passwordUtils";

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

export const resetPassword = async (c: Context) => {
	const id = c.req.param("id");
	const { oldPassword, newPassword } = await c.req.json();

	try {
		const user = await userService.getUserById(Number(id));
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}
		const isOldPasswordCorrect = await comparePasswords(
			oldPassword,
			user.password,
		);
		if (!isOldPasswordCorrect) {
			return c.json({ error: "Incorrect old password" }, 400);
		}
		const hashedNewPassword = await hashPassword(newPassword);

		const updatedUser = await userService.updatePassword(
			Number(id),
			hashedNewPassword,
		);

		return c.json(updatedUser);
	} catch (error) {
		return c.json({ error: (error as Error).message }, 500);
	}
};
