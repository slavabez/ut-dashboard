"use server";

import { getUserById } from "@/data/user";
import { db } from "@/drizzle/db";
import { currentRole } from "@/lib/auth";
import { IActionResponse, UserSelectNonSensitive } from "@/lib/common-types";

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
