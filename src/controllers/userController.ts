/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import jwt from "jsonwebtoken";
import {
  validateRegistrationSchema,
  validateLoginSchema,
} from "../utils/userValidation";
import { appLogger } from "../logger/logger";
import { json } from "stream/consumers";
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phoneNumber, image } = req.body;

    // Validation
    const validationResult = validateRegistrationSchema(req.body);

    if (!validationResult.success) {
      return next(
        createHttpError(400, "Invalid input data", {
          details: validationResult.error,
        })
      );
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return next(createHttpError(409, "User with this email already exists"));
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    await userModel.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      image,
    });

    // Send success response
    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    console.error("Error in createUser:", error);
    next(createHttpError(500, "An error occurred while creating the user"));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    const validationResponse = validateLoginSchema(req.body);
    if (!validationResponse.success) {
      return next(createHttpError(400, "All fields are required"));
    }

    // Fetch user from database
    const user = await userModel.findOne({ email });
    if (!user) {
      return next(createHttpError(401, "user not found"));
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createHttpError(401, "Invalid email or password"));
    }

    // Create access token
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "1d",
    });

    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24);

    const cookiesOptionsDev = {
      expires: expirationTime,
      httpOnly: true,
    };

    const cookiesOptionsProd = {
      expires: expirationTime,
      httpOnly: true,
      secure: true,
      domain: "bart.com",
      sameSite: "none",
    };

    const cookiesOptions =
      process.env.NODE_ENV === "production"
        ? cookiesOptionsProd
        : cookiesOptionsDev;

    res.cookie("authToken", token, cookiesOptions);

    // Send response with token
    return res.status(200).json({ message: "Login successfull" });
  } catch (err) {
    // Global error handling
    return next(createHttpError(500, "Internal server error"));
  }
};

const profiler = async (req: Request, res: Response, next: NextFunction) => {
  // console.log(req);
  //logger bydefault log string
  appLogger.info(JSON.stringify(req.cookies));
  try {
    const authToken = req.cookies.authToken;
    console.log(authToken);
    if (!authToken) {
      res.status(401).json({ logged_in: false });
      return;
    }

    const JWTPayload = jwt.verify(authToken, config.jwtSecret as string);
    console.log(JWTPayload);
    const user_id = JWTPayload.sub;
    console.log(user_id);
    if (!user_id) {
      res.status(500).json({ logged_in: false });
      return;
    }

    const thisUser = await userModel.findById(user_id);
    console.log(thisUser);
    res.status(200).json({
      logged_in: true,
      data: thisUser,
    });
  } catch (err) {
    console.log(err);
    if (err) {
      return res.status(500).json({
        error: "Session timed out, please login again",
      });
    }
  }
};

export { createUser, loginUser, profiler };
