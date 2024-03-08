import { count, desc, eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { syncLogs } from "@/drizzle/schema";

export const getLatestSyncs = async (params: {
  limit: number;
  offset: number;
}) => {
  const { limit, offset } = params;
  return db.query.syncLogs.findMany({
    limit: limit ?? 10,
    offset: offset ?? 0,
    orderBy: [desc(syncLogs.createdAt)],
  });
};

export const getSyncCount = async (type?: string) => {
  if (type) {
    const res = await db
      .select({ value: count(syncLogs.id) })
      .from(syncLogs)
      .where(eq(syncLogs.type, type));
    return res[0]?.value || 0;
  }
  const res = await db.select({ value: count(syncLogs.id) }).from(syncLogs);
  return res[0]?.value || 0;
};
