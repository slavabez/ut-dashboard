// This file exists for middleware functions, had to be Edge-runtime compatible
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/drizzle/db";
import { UserSelect, users } from "@/drizzle/schema";
import { normalizePhoneNumber } from "@/lib/utils";

export const getUserByPhoneCached = unstable_cache(
  async (phone) => getUserByPhone(phone),
  ["user-by-phone"],
  {
    revalidate: 60 * 60,
  },
);

export const getUserByPhone = async (
  phone: string,
): Promise<UserSelect | null> => {
  try {
    return await db
      .select()
      .from(users)
      .where(eq(users.phone, normalizePhoneNumber(phone)))
      .then((result) => result[0]);
  } catch (error) {
    console.error(error);
    return null;
  }
};
