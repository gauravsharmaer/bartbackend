import express from "express";
import {
  createUser,
  loginUser,
  profiler,
  loginUserWithFace,
  verifyUserFace,
  updateUserFaceDescriptor,
  logout,
} from "../controllers/userController";
import {
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/emailController";
// import rateLimit from "express-rate-limit";
const userRouter = express.Router();

userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", profiler);
userRouter.post("/send-otp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/login-with-face", loginUserWithFace);
userRouter.post("/verify-user-face", verifyUserFace);
userRouter.post("/update-face-descriptor", updateUserFaceDescriptor);
userRouter.get("/logout", logout);
export default userRouter;
