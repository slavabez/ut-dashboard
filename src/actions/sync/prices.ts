"use server";

import { desc, eq } from "drizzle-orm";
import hash from "hash-it";

import { db } from "@/drizzle/db";
import { SyncLogSelect, nomenclatures, syncLogs } from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1c-adapter";
import { currentRole } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import { From1C } from "@/lib/odata";
import { ISyncLogMeta } from "@/lib/sync";

export async function syncPrices(
  forceIncremental = false,
): Promise<IActionResponse<SyncLogSelect>> {
  try {
    const role = await currentRole();

    if (role !== "admin") {
      return {
        status: "error",
        error: "У вас недостаточно прав для этого действия",
      };
    }

    const allPriceData = await From1C.getAllPrices();
    const hashOf1CData = hash(allPriceData).toString();
    const syncResultMeta: ISyncLogMeta = {
      entitiesFrom1C: allPriceData.length,
      entitiesUpdated: 0,
      entitiesIgnored: 0,
      entitiesMarkedDeleted: 0,
      entitiesCreated: 0,
    };

    const lastPriceSync = await db.query.syncLogs.findFirst({
      where: eq(syncLogs.type, "prices"),
      orderBy: [desc(syncLogs.createdAt)],
    });

    const latestHash = lastPriceSync?.dataHash;
    if (latestHash && latestHash === hashOf1CData && !forceIncremental) {
      // No changes in the data, no need to sync
      syncResultMeta.entitiesIgnored = allPriceData.length;
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
          syncResultMeta.entitiesUpdated++;
        } else {
          syncResultMeta.entitiesIgnored++;
        }
      });
      // Update the prices inside the transaction
      await Promise.all(updatePromises);
    });

    return saveSyncLog(hashOf1CData, syncResultMeta);
  } catch (e) {
    console.error("Error while syncing prices", e);
    return {
      status: "error",
      error: "Error while syncing prices",
    };
  }
}

async function saveSyncLog(
  hashOf1CData: string,
  syncMeta: ISyncLogMeta,
  status = "success",
): Promise<IActionResponse<SyncLogSelect>> {
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
      status: "error",
      error: "Failed to log sync result",
    };
  }

  return {
    status: "success",
    data: syncResultFromDB[0],
  };
}
