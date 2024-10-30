import mongoose from "mongoose";
import { OTP } from "../types/userTypes";

const otpSchema = new mongoose.Schema<OTP>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

//collection will be created by name of Users
export default mongoose.model<OTP>("OTP", otpSchema);
