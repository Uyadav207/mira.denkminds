import type { PrismaClient } from "@prisma/client";
import { hashPassword, comparePasswords } from "../utils/passwordUtils";

export class AuthService {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	async register(email: string, password: string) {
		const existingUser = await this.prisma.user.findUnique({
			where: { email },
		});
		if (existingUser) {
			throw new Error("User already exists");
		}

		const hashedPassword = await hashPassword(password);
		return this.prisma.user.create({
			data: {
				email,
				password: hashedPassword,
			},
		});
	}

	async login(email: string, password: string) {
		const user = await this.prisma.user.findUnique({ where: { email } });
		if (!user) {
			throw new Error("Invalid credentials");
		}

		const isPasswordValid = await comparePasswords(password, user.password);
		if (!isPasswordValid) {
			throw new Error("Invalid credentials");
		}

		return user;
	}
}
