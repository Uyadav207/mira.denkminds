import { Hono } from "hono";
import { register, login } from "../controllers/authController";

const authRoutes = new Hono();

authRoutes.post("/register", register);
authRoutes.post("/login", login);

export { authRoutes };
