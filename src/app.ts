import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./Routes/userRouter";

const app = express();
app.use(cors());
//used for json parsing
app.use(express.json());
//Routes

app.get("/", (req, res) => {
  //create error to check if global error handler is working or not
  //   const error = createHttpError(400, "something went wrong");
  //   throw error;
  res.json({
    message: "welcome to backend api",
  });
});

app.use("/api/users", userRouter);

//global error handler middleware should present in last of application and has 4 parameters
app.use(globalErrorHandler);
export default app;
