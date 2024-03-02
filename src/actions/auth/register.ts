import { eq } from "drizzle-orm";
import { z } from "zod";

import { signIn } from "@/auth";
import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import { From1C } from "@/lib/odata";
import { normalizePhoneNumber } from "@/lib/utils";
import { RegisterSchema } from "@/schemas";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  // Trim the phone number and remove any spaces
  values.phone = normalizePhoneNumber(values.phone);
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: validatedFields.error };
  }

  const { phone } = validatedFields.data;
  // First off, we need to check if the phone number exists in the database
  const existingUser = await db.query.users.findFirst({
    where: eq(users.phone, phone),
  });
  if (existingUser) {
    // TODO: sign in the user and return
  }

  // Fetch the users from 1C, verify the phone number exists
  const all1CUsers = await From1C.getAllUsers();
};
