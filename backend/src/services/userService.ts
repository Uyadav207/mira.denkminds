import type { PrismaClient } from "@prisma/client";
import type User from "../models/User";
import redis from "../config/redis";
import { transporter } from "../config/nodemailer";
import { generateOtp } from "../utils/otpUtils";
import { hashPassword } from "../utils/passwordUtils";

export class UserService {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	// TODO: Get user by id
	async getUserById(id: number) {
		try {
			const user = await this.prisma.user.findUnique({ where: { id } });
			if (!user) {
				throw new Error("User not found");
			}
			return user;
		} catch (error) {
			console.error(`Error fetching user by ID ${id}:`, error);
			throw new Error("An error occurred while fetching the user");
		}
	}

	// TODO: Update user by id
	async updateUserById(id: number, data: Partial<User>) {
		try {
			const user = await this.prisma.user.findUnique({ where: { id } });
			if (!user) {
				throw new Error("User not found");
			}
			return await this.prisma.user.update({ where: { id }, data });
		} catch (error) {
			console.error(`Error updating user by ID ${id}:`, error);
			throw new Error("An error occurred while updating the user");
		}
	}

	// TODO: Delete user by id
	async deleteUserById(id: number) {
		try {
			const user = await this.prisma.user.findUnique({ where: { id } });
			if (!user) {
				throw new Error("User not found");
			}
			return await this.prisma.user.delete({ where: { id } });
		} catch (error) {
			console.error(`Error deleting user by ID ${id}:`, error);
			throw new Error("An error occurred while deleting the user");
		}
	}

	// TODO: update/change password
	async updatePassword(id: number, password: string) {
		try {
			const user = await this.prisma.user.findUnique({ where: { id } });
			if (!user) {
				throw new Error("User not found");
			}
			const hashedPassword = await hashPassword(password);
			return await this.prisma.user.update({
				where: { id },
				data: { password: hashedPassword },
			});
		} catch (error) {
			console.error(`Error updating password for user ID ${id}:`, error);
			throw new Error("An error occurred while updating the password");
		}
	}

	// TODO: Request for password reset
	async requestPasswordReset(email: string) {
		try {
			const user = await this.prisma.user.findUnique({ where: { email } });
			if (!user) {
				throw new Error("User not found");
			}

			const otp = generateOtp();
			await redis.set(`reset:${email}`, otp, "EX", 10 * 60).catch((err) => {
				console.error("Redis error while setting OTP:", err);
				throw new Error("Unable to process the OTP request. Please try again.");
			});

			await transporter.sendMail({
				from: process.env.EMAIL_USER,
				to: email,
				subject: "Password Reset OTP",
				text: `Your OTP is: ${otp}`,
			});

			return { message: "OTP sent to email" };
		} catch (error) {
			console.error(
				`Error requesting password reset for email ${email}:`,
				error,
			);
			throw new Error("An error occurred while requesting the password reset");
		}
	}

	// TODO: Verify OTP
	async verifyOtp(email: string, otp: string) {
		try {
			const storedOtp = await redis.get(`reset:${email}`).catch((err) => {
				console.error("Redis error while fetching OTP:", err);
				throw new Error("Unable to verify the OTP. Please try again.");
			});
			if (!storedOtp || storedOtp !== otp) {
				throw new Error("Invalid or expired OTP");
			}

			await redis.del(`reset:${email}`).catch((err) => {
				console.error("Redis error while deleting OTP:", err);
			});

			return { message: "OTP verified successfully" };
		} catch (error) {
			console.error(`Error verifying OTP for email ${email}:`, error);
			throw new Error("An error occurred while verifying the OTP");
		}
	}

	// TODO: Reset password
	async resetPassword(
		email: string,
		newPassword: string,
		confirmPassword: string,
	) {
		try {
			if (newPassword !== confirmPassword) {
				throw new Error("Passwords do not match");
			}

			const hashedPassword = await hashPassword(newPassword);
			await this.prisma.user.update({
				where: { email },
				data: { password: hashedPassword },
			});

			return { message: "Password reset successfully" };
		} catch (error) {
			console.error(`Error resetting password for email ${email}:`, error);
			throw new Error("An error occurred while resetting the password");
		}
	}
}
