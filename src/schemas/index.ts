import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// +77017054345

export const RegisterSchema = z.object({
  phone: z
    .string()
    .min(11, {
      message: "Номер телефона должен содержать 11 или 12 символов",
    })
    .max(12, {
      message: "Номер телефона должен содержать 11 или 12 символов",
    })
    .startsWith("+7", {
      message: "Номер телефона должен начинаться с +7",
    }),
});

export const ResetSchema = z.object({
  email: z.string().email(),
});
