import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("connected to database");
    });
    //error after connecting to db
    mongoose.connection.on("error", (error) => {
      console.error("failed to connect to database", error);
    });
    await mongoose.connect(config.databaseUrl as string);
  } catch (error) {
    console.error("failed to connect to database", error);
    //we will stop sever (without db server is of no use)
    process.exit(1);
  }
};

export default connectDB;
