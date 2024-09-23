/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { z } from "zod";
import { User } from "./userTypes";
const validateRegisterSchema = (obj: User) => {
  const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    phoneNumber: z.string(),
    image: z.string(),
  });
  const response = createUserSchema.safeParse(obj);
  return response;
};

const validateLoginSchema = (obj: User) => {
  const loginUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const response = loginUserSchema.safeParse(obj);
  return response;
};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, confirmPassword, phoneNumber, image } =
    req.body;
  //validation
  const response = validateRegisterSchema(req.body);
  if (!response.success) {
    const error = createHttpError(400, "inputs are invalid");
    //will go to global error handler
    return next(error);
  }

  try {
    //database call to check if user exists
    const user = await userModel.findOne({ email });

    if (user) {
      const error = createHttpError(400, "user already exists");
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error while creating user"));
  }

  //save user password after hasing with bcrypt
  const hashedpassword = await bcrypt.hash(password, 10);

  try {
    //creating user in db

    await userModel.create({
      name,
      email,
      password: hashedpassword,
      confirmPassword,
      phoneNumber,
      image,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating user"));
  }

  try {
    //response status 201 as we creating something
    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    return next(createHttpError(500, "Error while creating user"));
  }
};

// const loginUser = async (req: Request, res: Response, next: NextFunction) => {
//   const { email, password } = req.body;
//   //validation
//   const response = validateLoginSchema(req.body);
//   if (!response.success) {
//     const error = createHttpError(400, "All fileds are required");
//     //will go to global error handler
//     return next(error);
//   }

//   //database call to check if user exists
//   const user = await userModel.findOne({ email });

//   if (!user) {
//     const error = createHttpError(404, "user not found");
//     return next(error);
//   }

//   //matching the user password
//   const isMatch = await bcrypt.compare(password, user.password);
//   //if do not match
//   if (!isMatch) {
//     const error = createHttpError(400, "userName or password incorrect");
//     return next(error);
//   }

//   //if matches then create accesstoken
//   const token = sign({ sub: user._id }, config.jwtSecret as string, {
//     expiresIn: "7d",
//   });

//   res.status(201).json({ accessToken: token });
// };

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
      expiresIn: "7d",
    });

    // Send response with token
    return res.status(200).json({ accessToken: token });
  } catch (err) {
    // Global error handling
    return next(createHttpError(500, "Internal server error"));
  }
};

export { createUser, loginUser };
