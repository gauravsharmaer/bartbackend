/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import nodemailer from "nodemailer";
import { generateOTP } from "../utils/otpGenerate";
import { config } from "../config/config";
import otpModel from "../models/otpModels";
import { validateEmail } from "../utils/userValidation";
import userModel from "../models/userModel";

import bcrypt from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import jwt from "jsonwebtoken";
const FROM_EMAIL = config.smtpUser;
const OTP_EXPIRY_MINUTES = 10;

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: 465,
  secure: true,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !validateEmail(email)) {
      return next(createHttpError(400, "Invalid email address"));
    }
    //check if user exists in database
    const userExists = await userModel.findOne({ email });
    if (!userExists) {
      return next(createHttpError(400, "User does not exist"));
    }

    // Check if an unexpired OTP already exists
    const currentUTCTime = new Date();
    // const existingOTP = await otpModel.findOne({
    //   email,
    //   expiresAt: { $gt: currentUTCTime },
    // });

    // if (existingOTP) {
    //   const timeLeft = Math.ceil(
    //     (existingOTP.expiresAt.getTime() - currentUTCTime.getTime()) / 60000
    //   );
    //   return res.status(429).json({
    //     success: false,
    //     message: `An OTP has already been sent. Please wait ${timeLeft} minutes before requesting a new one.`,
    //   });
    // }

    // Delete any existing OTP records for this email
    // await otpModel.deleteMany({ email });

    const OTP = generateOTP();
    const expiryTime = new Date(
      currentUTCTime.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    const mailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: "OTP for E-mail Verification of Bart Account",
      text: `Your OTP for E-mail Verification at Bart.ai is ${OTP}. This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes (UTC time).`,
      html: `<p>Your OTP for E-mail Verification at Bart.ai is <strong>${OTP}</strong>.</p>
             <p>This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes (UTC time).</p>`,
    };

    // Verify SMTP connection
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail(mailOptions);

    if (!info.messageId) {
      throw new Error("Failed to send email");
    }

    // Save or update OTP in database
    const result = await otpModel.findOneAndUpdate(
      { email },
      {
        email,
        otp: OTP,
        expiresAt: expiryTime,
      },
      { upsert: true, new: true, runValidators: true }
    );

    if (!result) {
      throw new Error("Failed to save OTP");
    }

    console.log(
      `OTP sent successfully to ${email} at ${currentUTCTime.toISOString()}`
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);

    if (error instanceof Error) {
      if (error.message === "Failed to send email") {
        return next(
          createHttpError(500, "Failed to send OTP. Please try again later.")
        );
      }
      // Handle specific nodemailer errors
      if (error.message.includes("ECONNREFUSED")) {
        return next(
          createHttpError(
            500,
            "Unable to connect to email server. Please try again later."
          )
        );
      }
      if (error.message.includes("Invalid login")) {
        return next(
          createHttpError(
            500,
            "Email service configuration error. Please contact support."
          )
        );
      }
    }

    // Generic error response
    return next(
      createHttpError(
        500,
        "An unexpected error occurred. Please try again later."
      )
    );
  }
};

const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !validateEmail(email)) {
      return next(createHttpError(400, "Invalid email address"));
    }
    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return next(createHttpError(400, "Invalid OTP"));
    }

    // Check if user exists in database
    const userExists = await userModel.findOne({ email });
    if (!userExists) {
      return next(createHttpError(400, "User does not exist"));
    }

    // Find the OTP in the database
    const otpRecord = await otpModel.findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return next(createHttpError(400, "Invalid or expired OTP"));
    }

    // Delete the used OTP
    await otpModel.deleteOne({ _id: otpRecord._id });

    console.log(
      `OTP verified successfully for ${email} at ${new Date().toISOString()}`
    );

    // const token = crypto.randomBytes(32).toString("hex");
    // const currentUTCTime = new Date();
    // const expiryTime = new Date(
    //   currentUTCTime.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
    // );

    // await userModel.findOneAndUpdate(
    //   { email },
    //   { passwordResetToken: token, passwordResetTokenExpiryTime: expiryTime },
    //   { new: true, runValidators: true }
    // );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      // token,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);

    if (error instanceof Error) {
      if (error.name === "MongoError") {
        return next(
          createHttpError(500, "Database error. Please try again later.")
        );
      }
    }

    return next(
      createHttpError(
        500,
        "An unexpected error occurred. Please try again later."
      )
    );
  }
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return next(createHttpError(400, "Invalid email address"));
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "24h",
    });

    const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.passwordResetToken = token;
    user.passwordResetTokenExpiryTime = expirationTime;
    await userModel.findOneAndUpdate(
      { email },
      {
        passwordResetToken: token,
        passwordResetTokenExpiryTime: expirationTime,
      },
      { new: true, runValidators: true }
    );

    const resetUrl = `${"http://localhost:5173"}/resetPassword?token=${token}`;

    const mailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: "Password Reset for Your Account",
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 day.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    next(createHttpError(500, "Failed to process password reset request"));
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return next(createHttpError(400, "Invalid input"));
    }

    const JWTPayload = jwt.verify(token, config.jwtSecret as string);
    console.log(JWTPayload);
    const user_id = JWTPayload.sub;
    console.log(user_id);
    if (!user_id) {
      return next(createHttpError(400, "Invalid reset token"));
    }

    const user = await userModel.findOne({
      _id: user_id,
      passwordResetToken: token,
    });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    if (
      user.passwordResetTokenExpiryTime &&
      user.passwordResetTokenExpiryTime < new Date()
    ) {
      return next(createHttpError(400, "Reset token expired"));
    }

    // const user = await userModel.findOne({
    //   email,
    //   passwordResetTokenExpiryTime: { $gt: new Date() },
    // });

    // if (!user || !user.passwordResetToken) {
    //   return next(createHttpError(400, "Invalid or expired reset token"));
    // }

    // Verify the JWT token

    // Check if the token matches the one stored in the user document
    // if (token !== user.passwordResetToken) {
    //   return next(createHttpError(400, "Invalid reset token"));
    // }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user's password and clear reset token fields
    await userModel.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiryTime: null,
      },
      { new: true, runValidators: true }
    );

    console.log(
      `Password reset successfully for ${
        user.email
      } at ${new Date().toISOString()}`
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error in reset password:", error);
    return next(
      createHttpError(500, "Failed to reset password. Please try again later.")
    );
  }
};

export { sendOtp, verifyOtp, forgotPassword, resetPassword };
