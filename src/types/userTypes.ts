export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  image: string;
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
