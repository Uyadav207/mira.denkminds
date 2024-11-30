import type { PrismaClient } from "@prisma/client";
import type User from "../models/User";

export class UserService {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	// TODO: Get user by id
	async getUserById(id: number) {
		const findUser = await this.prisma.user.findUnique({ where: { id } });
		if (!findUser) {
			throw new Error("User not found");
		}
		return findUser;
	}

	// TODO: Update user by id
	async updateUserById(id: number, data: Partial<User>) {
		const findUser = await this.prisma.user.findUnique({ where: { id } });
		if (!findUser) {
			throw new Error("User not found");
		}
		return this.prisma.user.update({ where: { id }, data });
	}

	// TODO: Delete user by id
	async deleteUserById(id: number) {
		const findUser = await this.prisma.user.findUnique({ where: { id } });
		if (!findUser) {
			throw new Error("User not found");
		}
		return this.prisma.user.delete({ where: { id } });
	}

	// TODO: Reset Password
	async updatePassword(id: number, password: string) {
		const user = await this.prisma.user.findUnique({ where: { id } });
		if (!user) {
			throw new Error("User not found");
		}
		return this.prisma.user.update({ where: { id }, data: { password } });
	}
}
