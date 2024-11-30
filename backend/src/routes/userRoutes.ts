import { Hono } from "hono";
import {
	deleteUserById,
	getUserById,
	resetPassword,
	updateUserById,
} from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

const userRoutes = new Hono();

userRoutes.get("/user/:id", authMiddleware, getUserById);
userRoutes.put("/user/edit/:id", authMiddleware, updateUserById);
userRoutes.delete("/user/delete/:id", authMiddleware, deleteUserById);
userRoutes.post("/user/reset/:id", authMiddleware, resetPassword);

export { userRoutes };
