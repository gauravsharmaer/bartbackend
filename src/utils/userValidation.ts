import { z } from "zod";
import { User } from "../types/userTypes";

export const validateRegistrationSchema = (obj: User) => {
  const createUserSchema = z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),

      phoneNumber: z.string().min(10, "Phone number is required"),
    })
    .required();
  return createUserSchema.safeParse(obj);
};

export const validateLoginSchema = (obj: User) => {
  const loginUserSchema = z
    .object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    })
    .required();
  return loginUserSchema.safeParse(obj);
};

export const validateEmail = (email: string) => {
  const emailSchema = z.string().email("Invalid email address");
  return emailSchema.safeParse(email);
};
