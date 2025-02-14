import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./Routes/userRouter";
import cookieParser from "cookie-parser";
const app = express();
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Updated origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Explicitly specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"], // Explicitly specify allowed headers
    exposedHeaders: ["set-cookie"], // Important for cookies
  })
);
//used for json parsing
app.use(express.json());

app.use(cookieParser());
//Routes

app.get("/", (req, res) => {
  //create error to check if global error handler is working or not
  //   const error = createHttpError(400, "something went wrong");
  //   throw error;
  res.json({
    message: "welcome to backend api",
  });
});

// Serve static files from 'uploads' directory
app.use("/uploads", express.static("uploads"));

app.use("/api/users", userRouter);

//global error handler middleware should present in last of application and has 4 parameters
app.use(globalErrorHandler);
export default app;
