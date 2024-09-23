/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";
const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
      message: err.message,
      //error stack tells which file has error show it only in dev not in production otherwise it will show
      //our file internal structure which is not good for security
      errStack: config.env === "development" ? err.stack : "",
    });
  }
};

export default globalErrorHandler;
