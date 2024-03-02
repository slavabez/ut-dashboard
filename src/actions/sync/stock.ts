"use server";

import { desc, eq } from "drizzle-orm";
import hash from "hash-it";

import { db } from "@/drizzle/db";
import { SyncLogSelect, nomenclatures, syncLogs } from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1CAdapter";
import { From1C } from "@/lib/odata";

export interface StockSyncMeta {
  totalFrom1C: number;
  stockUpdated: number;
  stockIgnored: number;
}

interface SyncResult {
  success: boolean;
  error?: string;
  syncResult?: SyncLogSelect;
}

export async function syncStock(forceIncremental = false): Promise<SyncResult> {
  try {
    const allStockData = await From1C.getAllStock();
    const hashOf1CData = hash(allStockData).toString();
    const syncResultMeta = {
      totalFrom1C: allStockData.length,
      stockUpdated: 0,
      stockIgnored: 0,
    };

    const lastStockSync = await db.query.syncLogs.findFirst({
      where: eq(syncLogs.type, "stock"),
      orderBy: [desc(syncLogs.createdAt)],
    });

    const latestHash = lastStockSync?.dataHash;
    if (latestHash && latestHash === hashOf1CData && !forceIncremental) {
      // No changes in the data, no need to sync
      syncResultMeta.stockIgnored = allStockData.length;
      return saveSyncLog(hashOf1CData, syncResultMeta, "ignored");
    }

    const allStockFromDb = await db
      .select({
        id: nomenclatures.id,
        stock: nomenclatures.stock,
        stockUpdatedAt: nomenclatures.stockUpdatedAt,
        stockDate: nomenclatures.stockDate,
      })
      .from(nomenclatures);

    await db.transaction(async (tx) => {
      const updatePromises: Promise<any>[] = [];
      // Changes in the data, sync the prices
      const stockFormatted = allStockData.map((stock) =>
        ConvertFrom1C.stock(stock),
      );
      stockFormatted.map((p) => {
        const existingStock = allStockFromDb.find(
          (dbPrice) => dbPrice.id === p.nomenclatureId,
        );
        if (existingStock) {
          if (existingStock.stock !== p.stock) {
            updatePromises.push(
              tx
                .update(nomenclatures)
                .set({
                  stock: p.stock,
                  stockDate: p.stockDate,
                  stockUpdatedAt: new Date(),
                })
                .where(eq(nomenclatures.id, p.nomenclatureId)),
            );
            syncResultMeta.stockUpdated++;
          } else {
            syncResultMeta.stockIgnored++;
          }
        }
      });
      // Update the prices inside the transaction
      await Promise.all(updatePromises);
    });

    return saveSyncLog(hashOf1CData, syncResultMeta);
  } catch (e) {
    console.error("Error while syncing prices", e);
    return {
      success: false,
      error: "Error while syncing prices",
    };
  }
}

async function saveSyncLog(
  hashOf1CData: string,
  syncMeta: StockSyncMeta,
  status = "success",
) {
  const syncResultFromDB = await db
    .insert(syncLogs)
    .values({
      dataHash: hashOf1CData,
      type: "stock",
      status,
      metadata: syncMeta,
    })
    .returning();

  if (syncResultFromDB.length === 0) {
    return {
      success: false,
      error: "Failed to log sync result",
    };
  }

  return {
    success: true,
    syncResult: syncResultFromDB[0],
  };
}
