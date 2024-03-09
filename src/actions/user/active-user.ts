"use server";

import { eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { UserSelect, users } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";

export const getActiveUser = async (): Promise<IActionResponse<UserSelect>> => {
  const user = await currentUser();
  if (!user || !user.id) {
    return {
      status: "error",
      error: "Пользователь не найден",
    };
  }
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: {
      id: true,
      email: true,
      phone: true,
      role: true,
      meta: true,
    },
  });
  if (!dbUser) {
    return {
      status: "error",
      error: "Пользователь не найден",
    };
  }

  // @ts-ignore non-certain fields
  if (dbUser.meta?.sitePassword) delete dbUser.meta.sitePassword;
  return {
    status: "success",
    data: dbUser as UserSelect,
  };
};
