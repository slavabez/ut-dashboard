import { count, desc, eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { syncLogs } from "@/drizzle/schema";

export const getLatestSyncs = async (params: {
  limit: number;
  offset: number;
  type?: string;
}) => {
  const { limit, offset, type } = params;
  const condition = db
    .select()
    .from(syncLogs)
    .orderBy(desc(syncLogs.createdAt))
    .limit(limit)
    .offset(offset);
  if (type) {
    condition.where(eq(syncLogs.type, type));
  }
  return condition;
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
