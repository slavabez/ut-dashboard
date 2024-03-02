"use server";

import { desc, eq } from "drizzle-orm";
import hash from "hash-it";

import { db } from "@/drizzle/db";
import { SyncLogSelect, nomenclatures, syncLogs } from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1CAdapter";
import { From1C } from "@/lib/odata";

export interface PriceSyncMeta {
  totalFrom1C: number;
  pricesUpdated: number;
  pricesIgnored: number;
}

interface SyncResult {
  success: boolean;
  error?: string;
  syncResult?: SyncLogSelect;
}

export async function syncPrices(
  forceIncremental = false,
): Promise<SyncResult> {
  try {
    const allPriceData = await From1C.getAllPrices();
    const hashOf1CData = hash(allPriceData).toString();
    const syncResultMeta = {
      totalFrom1C: allPriceData.length,
      pricesUpdated: 0,
      pricesIgnored: 0,
    };

    const lastPriceSync = await db.query.syncLogs.findFirst({
      where: eq(syncLogs.type, "prices"),
      orderBy: [desc(syncLogs.createdAt)],
    });

    const latestHash = lastPriceSync?.dataHash;
    if (latestHash && latestHash === hashOf1CData && !forceIncremental) {
      // No changes in the data, no need to sync
      syncResultMeta.pricesIgnored = allPriceData.length;
      return saveSyncLog(hashOf1CData, syncResultMeta, "ignored");
    }

    const allPricesFromDB = await db
      .select({
        id: nomenclatures.id,
        price: nomenclatures.price,
        priceUpdatedAt: nomenclatures.priceUpdatedAt,
        priceDate: nomenclatures.priceDate,
      })
      .from(nomenclatures);

    await db.transaction(async (tx) => {
      const updatePromises: Promise<any>[] = [];
      // Changes in the data, sync the prices
      const pricesFormatted = allPriceData.map((price) =>
        ConvertFrom1C.price(price),
      );
      pricesFormatted.map((p) => {
        const existingPrice = allPricesFromDB.find(
          (dbPrice) => dbPrice.id === p.nomenclatureId,
        );
        if (
          !existingPrice ||
          existingPrice.price !== p.price ||
          existingPrice.priceDate !== p.period
        ) {
          updatePromises.push(
            tx
              .update(nomenclatures)
              .set({
                price: p.price,
                priceDate: p.period,
                priceUpdatedAt: new Date(),
              })
              .where(eq(nomenclatures.id, p.nomenclatureId)),
          );
          syncResultMeta.pricesUpdated++;
        } else {
          syncResultMeta.pricesIgnored++;
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
  syncMeta: PriceSyncMeta,
  status = "success",
) {
  const syncResultFromDB = await db
    .insert(syncLogs)
    .values({
      dataHash: hashOf1CData,
      type: "prices",
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
