import { eq } from "drizzle-orm";
import { Session } from "next-auth";

import { auth, signOut } from "@/auth";
import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";

async function verifyInDb(session: Session | null): Promise<boolean> {
  if (!session) return true;
  const sessionUser = session?.user;
  if (!sessionUser?.id) return true;
  const user = await db.query.users.findFirst({
    where: eq(users.id, sessionUser.id),
    columns: {
      id: true,
      phone: true,
      name: true,
      role: true,
    },
  });

  // User no longer exists, invalid
  if (!user) return false;

  // One of the fields changed, invalidate the session
  if (user.phone !== sessionUser.phone) return false;
  if (user.name !== sessionUser.name) return false;
  if (user.role !== sessionUser.role) return false;

  return true;
}

export const currentUser = async () => {
  const session = await auth();
  const isVerified = await verifyInDb(session);
  if (!isVerified) {
    await signOut();
    return null;
  }
  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();
  const isVerified = await verifyInDb(session);
  if (!isVerified) {
    await signOut();
    return null;
  }
  return session?.user?.role;
};
