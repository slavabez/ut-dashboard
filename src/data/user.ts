import { eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { UserSelect, users } from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1CAdapter";
import { From1C } from "@/lib/odata";

export const getUserByEmail = async (
  email: string,
): Promise<UserSelect | null> => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length === 0) return null;
    return existingUser[0];
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserById = async (id: string): Promise<UserSelect | null> => {
  try {
    const existingUser = await db.select().from(users).where(eq(users.id, id));
    if (existingUser.length === 0) return null;
    return existingUser[0];
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUsersParsed = async () => {
  const allUsersRaw = await From1C.getAllUsers();
  const parsed = allUsersRaw.map((user) => {
    ConvertFrom1C.user(user);
  });
};
