import * as jwt from "jsonwebtoken";

export class JwtService {
	private readonly secret: string;

	constructor() {
		this.secret = process.env.JWT_SECRET || "your-secret-key";
	}

	generateToken(userId: number): string {
		return jwt.sign({ userId }, this.secret, { expiresIn: "1d" });
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	verifyToken(token: string): any {
		return jwt.verify(token, this.secret);
	}
}
