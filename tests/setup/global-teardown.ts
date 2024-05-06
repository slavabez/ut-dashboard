import { eq } from "drizzle-orm";

import { users } from "@/drizzle/schema";
import { testDb } from "@/drizzle/test-db";

const deleteUserByPhone = async (phone: string) => {
  const deletedUser = await testDb.delete(users).where(eq(users.phone, phone));
  if (deletedUser.length === 0) {
    throw new Error("Failed to delete user");
  }
  return deletedUser[0];
};

export default async function globalTeardown() {
  console.log("Global teardown starting...");

  // Delete the users created in global setup
  await deleteUserByPhone("+77050000000");
  await deleteUserByPhone("+77050000001");
  await deleteUserByPhone("+77050000002");
  await deleteUserByPhone("+77050000003");

  console.log("Global teardown finished");
}
