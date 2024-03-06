"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getUsersParsed } from "@/data/user";
import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import { normalizePhoneNumber } from "@/lib/utils";
import { RegisterSchema } from "@/schemas";

export const register = async (
  values: z.infer<typeof RegisterSchema>,
): Promise<{ success?: string; error?: string }> => {
  // Trim the phone number and remove any spaces
  values.phone = normalizePhoneNumber(values.phone);
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: validatedFields.error.message };
  }

  const { phone } = validatedFields.data;
  // First off, we need to check if the phone number exists in the database
  const existingUser = await db.query.users.findFirst({
    where: eq(users.phone, phone),
  });
  if (existingUser) {
    return {
      error: "У вас уже есть профиль, заходите через страницу Войти",
    };
  }

  // Fetch the users from 1C, verify the phone number exists
  const all1CUsers = await getUsersParsed();
  const user = all1CUsers.find((user) => user.phone === phone);
  if (user) {
    // Found the relevant user in 1c, create the user in our db
    if (!user.sitePassword) {
      return {
        error:
          "У вас не установлен пароль, пожалуйста свяжитесь с тех поддержкой",
      };
    }
    if (!user.siteRole) {
      return {
        error:
          "У вас не установлена роль, пожалуйста свяжитесь с тех поддержкой",
      };
    }
    const hashedPassword = await bcrypt.hash(user.sitePassword, 10);
    const newUserRes = await db
      .insert(users)
      .values({
        id: user.id,
        phone: user.phone,
        name: user.name,
        password: hashedPassword,
        email: user.email,
        role: "employee",
        meta: user,
      })
      .returning();
    if (newUserRes.length === 0) {
      return {
        error: "Ошибка при создании профиля",
      };
    }
    return {
      success: `Ваш профиль был создан, ${newUserRes[0].name}. Вы можете войти на сайт с помощью номера телефона и пароля`,
    };
  } else {
    return {
      error: "Ваш номер телефона не найден в базе одобренных номеров",
    };
  }
};
