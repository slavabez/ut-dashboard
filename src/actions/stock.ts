"use server";

import { and, desc, eq, gt, ilike, lt } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { nomenclatures, syncLogs } from "@/drizzle/schema";
import { IActionResponse } from "@/lib/common-types";

export async function getLatestStockSyncTime() {
  const latestSync = await db
    .select()
    .from(syncLogs)
    .where(eq(syncLogs.type, "stock"))
    .orderBy(desc(syncLogs.createdAt))
    .limit(1);

  if (!latestSync || latestSync.length === 0) {
    return null;
  }

  return latestSync[0].createdAt;
}

export interface IStockFilters {
  name?: string;
  manufacturerId?: string;
  inStockOnly?: string;
}

export async function getStockWithFilters(
  params: IStockFilters,
): Promise<IActionResponse<any[]>> {
  try {
    const { name, manufacturerId, inStockOnly } = params;
    const query = db.select().from(nomenclatures);

    const whereParts = [eq(nomenclatures.isFolder, false)];

    if (name) {
      whereParts.push(ilike(nomenclatures.name, `%${name}%`));
    }

    if (manufacturerId) {
      whereParts.push(eq(nomenclatures.manufacturerId, manufacturerId));
    }

    if (inStockOnly === "1") {
      whereParts.push(gt(nomenclatures.stock, 0));
    }

    query.where(and(...whereParts));

    const stock = await query;

    return {
      status: "success",
      data: stock.map((ni) => ({
        ...ni,
        coverImage: !!ni.coverImage
          ? process.env.NEXT_PUBLIC_FILE_URL + ni.coverImage
          : null,
      })),
    };
  } catch (e) {
    console.error("getStockWithFilters error:", e);
    return {
      status: "error",
      error: "Ошибка при получении последних остатков",
    };
  }
}
