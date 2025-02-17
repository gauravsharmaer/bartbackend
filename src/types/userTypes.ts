import mongoose from "mongoose";

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  imagePath: string;
  passwordResetToken: string;
  passwordResetTokenExpiryTime: Date;
  faceDescriptor: number[];
}

export interface OTP {
  _id: string;
  email: string;
  otp: string;
  expiresAt: Date;
}

// Interface for individual messages
export interface IMessage {
  _id?: mongoose.Types.ObjectId;
  sender: string;
  content: string;
  timestamp: Date;
  read: boolean;
  edited?: boolean;
}

// Interface for the chat document
export interface IChat extends Document {
  participants: string[];
  messages: IMessage[];
  lastMessage: IMessage;
  createdAt: Date;
  updatedAt: Date;
}