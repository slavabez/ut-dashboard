import * as z from "zod";

import { UserRoleMap } from "@/drizzle/schema";

const PHONE_REGEX = /^(8|\+7)[\d\-()]+$/;
const PHONE_SCHEMA = z
  .string()
  .min(11, {
    message: "Номер телефона слишком короткий",
  })
  .max(20, {
    message: "Номер телефона слишком длинный",
  })
  .regex(PHONE_REGEX, {
    message:
      "Номер телефона должен начинаться с +7 или 8, и содержать только цифры, пробелы, скобки и дефисы",
  });

export const LoginSchema = z.object({
  phone: PHONE_SCHEMA,
  password: z.string(),
});

export const RegisterSchema = z.object({
  phone: PHONE_SCHEMA,
});

const userRoles = Array.from(UserRoleMap.keys());

export const UserUpdateSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: PHONE_SCHEMA,
  role: z.enum([userRoles[0], ...userRoles.slice(1)]),
});
