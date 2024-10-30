import mongoose from "mongoose";
import { User } from "../types/userTypes";

const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    faceDescriptor: {
      type: [Number],
      required: true,
    },
    passwordResetToken: {
      type: String,
      required: false,
      default: null,
    },
    passwordResetTokenExpiryTime: {
      type: Date,
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

//collection will be created by name of Users
export default mongoose.model<User>("User", userSchema);
