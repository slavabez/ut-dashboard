import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { UserInsert, users } from "@/drizzle/schema";
import { testDb } from "@/drizzle/test-db";

const createNewUser = async (user: UserInsert) => {
  if (!user.password) {
    throw new Error("Password is required");
  }
  const hashedPassword = await bcrypt.hash(user.password, 10);

  const newUser = await testDb
    .insert(users)
    .values({
      ...user,
      password: hashedPassword,
    })
    .onConflictDoUpdate({
      target: users.phone,
      set: {
        ...user,
        password: hashedPassword,
      },
      where: eq(users.phone, user.phone ?? ""),
    })
    .returning();
  if (newUser.length === 0) {
    throw new Error("Failed to create new user");
  }
  return newUser[0];
};

export default async function globalSetup() {
  console.log("Global setup starting...");

  // Create new users, one for each role
  await createNewUser({
    name: "client user",
    role: "client",
    phone: "+77050000000",
    password: "client-password",
  });

  await createNewUser({
    name: "employee user",
    role: "employee",
    phone: "+77050000001",
    password: "employee-password",
  });

  await createNewUser({
    name: "manager user",
    role: "manager",
    phone: "+77050000002",
    password: "manager-password",
  });

  await createNewUser({
    name: "admin user",
    role: "admin",
    phone: "+77050000003",
    password: "admin-password",
  });

  console.log("Global setup finished");
}
