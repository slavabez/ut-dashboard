"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { signOut } from "@/auth";
import { db } from "@/drizzle/db";
import { UserSelect, userRoleValues, users } from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1c-adapter";
import { currentRole, currentUser } from "@/lib/auth";
import {
  IActionResponse,
  IUserMeta,
  UserSelectNonSensitive,
} from "@/lib/common-types";
import { getUserByGuid } from "@/lib/odata/users";
import { getLatestSiteSettings } from "@/lib/site-settings";
import { getUserById } from "@/lib/user";
import { UserUpdateSchema } from "@/schemas";

export async function getAllUsers(): Promise<
  IActionResponse<UserSelectNonSensitive[]>
> {
  const role = await currentRole();

  if (role !== "admin") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }
  try {
    const users = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        phone: true,
        role: true,
        meta: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        image: true,
        emailVerified: true,
      },
    });
    return {
      status: "success",
      data: users,
    };
  } catch (e) {
    console.error(e);
    return {
      status: "error",
      error: "Ошибка при получении данных пользователей",
    };
  }
}

export async function getUserByIdAction(
  id: string,
): Promise<IActionResponse<UserSelectNonSensitive>> {
  const role = await currentRole();

  if (role !== "admin") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }
  try {
    const user = await getUserById(id);
    if (!user) {
      return {
        status: "error",
        error: "Пользователь не найден",
      };
    }
    return {
      status: "success",
      data: user,
    };
  } catch (e) {
    console.error(e);
    return {
      status: "error",
      error: "Ошибка при получении данных пользователя",
    };
  }
}

export async function updateUserById(
  id: string,
  data: z.infer<typeof UserUpdateSchema>,
): Promise<IActionResponse<UserSelectNonSensitive>> {
  const role = await currentRole();

  if (role !== "admin") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }

  // Only these fields can be updated
  // TODO: add server side validation + a more robust way to update user data
  const cleanData: Partial<UserSelect> = {
    updatedAt: new Date(),
  };
  if (data.name) {
    cleanData.name = data.name;
  }
  if (data.email) {
    cleanData.email = data.email;
  }
  if (data.phone) {
    cleanData.phone = data.phone;
  }
  if (data.role) {
    cleanData.role = data.role as userRoleValues;
  }

  try {
    const result = await db
      .update(users)
      .set(cleanData)
      .where(eq(users.id, id))
      .returning();
    if (result.length === 0) {
      return {
        status: "error",
        error: "Пользователь не найден",
      };
    }
    if (result[0].id === id) {
      const user = result[0];
      if (user.password) user.password = "hidden";
      // @ts-ignore cba to type the whole meta object atm
      if (user.meta?.sitePassword) user.meta.sitePassword = "hidden";
      revalidatePath(`/admin/users/${result[0].id}`);
      return {
        status: "success",
        data: user,
      };
    }

    return {
      status: "error",
      error: "Ошибка при обновлении данных пользователя",
    };
  } catch (e) {
    console.error(e);
    return {
      status: "error",
      error: "Ошибка при обновлении данных пользователя",
    };
  }
}

export async function fetchMetaFrom1C(
  userIdFrom1C: string,
): Promise<IActionResponse<UserSelect>> {
  if (!userIdFrom1C) {
    return {
      status: "error",
      error: "Не указан id пользователя из 1C",
    };
  }
  // Check if the id is valid GUID
  const guidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  if (!guidRegex.test(userIdFrom1C)) {
    return {
      status: "error",
      error: "Неверный формат id пользователя из 1C",
    };
  }
  const from1c = await getUserByGuid(userIdFrom1C);
  const siteSettings = await getLatestSiteSettings();
  const parsed = ConvertFrom1C.user(from1c, siteSettings);

  if (!parsed.phone) {
    return {
      status: "error",
      error: "У пользователя из 1C не указан номер телефона",
    };
  }

  // Find the user in our db by the phone number
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.phone, parsed.phone));
  if (existingUser.length === 0) {
    return {
      status: "error",
      error: "Пользователь с таким номером телефона не найден",
    };
  }
  // @ts-ignore cba to type the whole meta object atm
  let newMeta: IUserMeta = existingUser[0].meta;

  if (parsed.name && parsed.name !== newMeta.name) newMeta.name = parsed.name;
  if (parsed.iin && parsed.iin !== newMeta.iin) newMeta.iin = parsed.iin;
  if (parsed.realId && parsed.realId !== newMeta.realId)
    newMeta.realId = parsed.realId;
  if (parsed.realName && parsed.realName !== newMeta.realName)
    newMeta.realName = parsed.realName;
  if (parsed.siteRole && parsed.siteRole !== newMeta.siteRole)
    newMeta.siteRole = parsed.siteRole as "admin" | "user";
  if (parsed.email && parsed.email !== newMeta.email)
    newMeta.email = parsed.email;
  if (parsed.phone && parsed.phone !== newMeta.phone)
    newMeta.phone = parsed.phone;
  if (parsed.showOnSite && parsed.showOnSite !== newMeta.showOnSite)
    newMeta.showOnSite = parsed.showOnSite;

  const result = await db
    .update(users)
    .set({ meta: newMeta, updatedAt: new Date() })
    .where(eq(users.phone, parsed.phone))
    .returning();

  revalidatePath(`/admin/users/${existingUser[0].id}`);

  if (result.length === 0) {
    return {
      status: "error",
      error: "Ошибка при обновлении данных пользователя",
    };
  }

  return {
    status: "success",
    data: result[0],
  };
}

export async function setUserPassword(
  userId: string,
  password: string,
): Promise<IActionResponse<UserSelectNonSensitive>> {
  const role = await currentRole();
  const loggedInUser = await currentUser();

  if (role !== "admin") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }

  const user = await getUserById(userId);

  if (!user) {
    return {
      status: "error",
      error: "Пользователь не найден",
    };
  }

  // Admins can't change other admins passwords
  if (user.role === "admin" && loggedInUser?.id !== user.id) {
    return {
      status: "error",
      error: "Нельзя изменить пароль администратора",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId))
      .returning();
    if (result.length === 0) {
      return {
        status: "error",
        error: "Пользователь не найден",
      };
    }
    revalidatePath(`/admin/users/${result[0].id}`);
    return {
      status: "success",
      data: result[0],
    };
  } catch (e) {
    console.error(e);
    return {
      status: "error",
      error: "Ошибка при установке пароля пользователя",
    };
  }
}

export async function deleteUser(
  userId: string,
): Promise<IActionResponse<string>> {
  const role = await currentRole();
  const currUser = await currentUser();

  if (role !== "admin") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }

  try {
    const result = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();
    if (result.length === 0) {
      return {
        status: "error",
        error: "Пользователь не найден",
      };
    }
    revalidatePath(`/admin/users`);
    if (userId === currUser?.id) {
      await signOut();
    }
    return {
      status: "success",
      data: userId,
    };
  } catch (e) {
    console.error(e);
    return {
      status: "error",
      error: "Ошибка при удалении пользователя",
    };
  }
}
