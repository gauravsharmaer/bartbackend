import express from "express";
import {
  createUser,
  loginUser,
  profiler,
  loginUserWithFace,
  verifyUserFace,
  updateUserFaceDescriptor,
  logout,
  uploadUserImage,
} from "../controllers/userController";
import {
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/emailController";
import multer from "multer";

// import rateLimit from "express-rate-limit";
const userRouter = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

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
userRouter.post("/upload-user-image", upload.single("image"), uploadUserImage);
export default userRouter;
