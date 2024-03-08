import * as z from "zod";

export const LoginSchema = z.object({
  phone: z
    .string()
    .min(11, {
      message: "Номер телефона должен содержать не менее 11 символов",
    })
    .max(20, {
      message: "Номер телефона должен содержать не более 20 символов",
    })
    .startsWith("+7", {
      message: "Номер телефона должен начинаться с +7",
    })
    .regex(/^(8|\+7)[\d\-()]+$/, "Неправильные символы в номере телефона"),
  password: z.string(),
});

export const RegisterSchema = z.object({
  phone: z
    .string()
    .min(11, {
      message: "Номер телефона должен содержать не менее 11 символов",
    })
    .max(20, {
      message: "Номер телефона должен содержать не более 20 символов",
    })
    .startsWith("+7", {
      message: "Номер телефона должен начинаться с +7",
    })
    .regex(/^(8|\+7)[\d\-()]+$/, "Неправильные символы в номере телефона"),
});