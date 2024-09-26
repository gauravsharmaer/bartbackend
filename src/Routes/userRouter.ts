import express from "express";
import { createUser, loginUser, profiler } from "../controllers/userController";
const userRouter = express.Router();

userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", profiler);
export default userRouter;
