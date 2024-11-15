import express from "express";
import {
  createUser,
  loginUser,
  profiler,
  loginUserWithFace,
  verifyUserFace,
} from "../controllers/userController";
import {
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/emailController";
// import rateLimit from "express-rate-limit";
const userRouter = express.Router();

// const otpLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 5,
//   message: "Too many OTP requests, please try again later.",
//   standardHeaders: true,
//   legacyHeaders: false,
// });

userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", profiler);
userRouter.post("/send-otp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/login-with-face", loginUserWithFace);
userRouter.post("/verify-user-face", verifyUserFace);
export default userRouter;
