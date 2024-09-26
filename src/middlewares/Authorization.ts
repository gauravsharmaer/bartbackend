import { NextFunction, Request, Response } from "express";
import { config } from "../config/config";
import jwt from "jsonwebtoken";

export const userLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authToken = req.cookies.authToken;

    if (!authToken) {
      return res.status(401).json({
        error: "You need to login first",
      });
    }

    const JWTPayload = jwt.verify(authToken, config.jwtSecret as string);

    const user_id = JWTPayload.sub;

    if (!user_id) {
      return res.status(401).json({
        error: "Something went wrong, please login again",
      });
    }

    res.locals.user_id = user_id;

    return next();
  } catch (err) {
    if (err) {
      return res.status(500).json({
        error: "Session timed out, please login again",
      });
    }
  }
};
