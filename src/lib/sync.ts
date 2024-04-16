import { count, desc, eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { prices, syncLogs } from "@/drizzle/schema";

export const getLatestSyncs = async (params: {
  limit: number;
  offset: number;
  type?: string;
}) => {
  const { limit, offset, type } = params;
  const condition = db
    .select({
      id: syncLogs.id,
      type: syncLogs.type,
      status: syncLogs.status,
      metadata: syncLogs.metadata,
      createdAt: syncLogs.createdAt,
      updatedAt: syncLogs.updatedAt,
      priceId: syncLogs.priceId,
      priceName: prices.name,
    })
    .from(syncLogs)
    .leftJoin(prices, eq(syncLogs.priceId, prices.id))
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
