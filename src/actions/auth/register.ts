"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import { IActionResponse, UserSelectNonSensitive } from "@/lib/common-types";
import { getAndParse1CUsers } from "@/lib/user";
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
  const all1CUsers = await getAndParse1CUsers();

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
        role: user.siteRole as any,
        meta: user,
      })
      .returning();
    if (newUserRes.length === 0) {
      return {
        error: "Ошибка при создании профиля",
      };
    }
    revalidatePath(`/admin/users`);

    return {
      success: `Ваш профиль был создан, ${newUserRes[0].name}. Вы можете войти на сайт с помощью номера телефона и пароля`,
    };
  } else {
    return {
      error: "Ваш номер телефона не найден в базе одобренных номеров",
    };
  }
};

export async function addUserFrom1C(
  phone: string,
): Promise<IActionResponse<UserSelectNonSensitive>> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const existingUser = await db.query.users.findFirst({
    where: eq(users.phone, normalizedPhone),
  });
  if (existingUser) {
    return {
      status: "error",
      error: "Пользователь с таким номером телефона уже существует",
    };
  }

  const all1CUsers = await getAndParse1CUsers();
  const user = all1CUsers.find((user) => user.phone === phone);
  if (user) {
    // Found the relevant user in 1c, create the user in our db
    if (!user.sitePassword) {
      return {
        status: "error",
        error: "У пользователя не установлен доп. реквизит пароль в 1С",
      };
    }
    if (!user.siteRole) {
      return {
        status: "error",
        error: "У пользователя не установлен доп. реквизит роль на сайте",
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
        role: user.siteRole as any,
        meta: user,
      })
      .returning();
    if (newUserRes.length === 0) {
      return {
        status: "error",
        error: "Ошибка при создании профиля",
      };
    }
    revalidatePath(`/admin/users/${newUserRes[0].id}`);
    revalidatePath(`/admin/users`);
    return {
      status: "success",
      data: newUserRes[0],
    };
  } else {
    return {
      status: "error",
      error: "Пользователь не найден в базе 1С",
    };
  }
}
