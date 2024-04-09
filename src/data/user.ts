import { eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { UserSelect, users } from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1c-adapter";
import { getAllUsers } from "@/lib/odata/users";
import { getLatestSiteSettings } from "@/lib/site-settings";
import { normalizePhoneNumber } from "@/lib/utils";

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

export const getUserByPhone = async (
  phone: string,
): Promise<UserSelect | null> => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.phone, normalizePhoneNumber(phone)));
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

export async function getAndParse1CUsers() {
  const all1CUsersRaw = await getAllUsers();
  const siteSettings = await getLatestSiteSettings();
  return all1CUsersRaw.map((u) => ConvertFrom1C.user(u, siteSettings));
}
