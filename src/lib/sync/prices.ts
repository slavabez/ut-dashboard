"use server";

import { and, desc, eq } from "drizzle-orm";
import hash from "hash-it";

import { db } from "@/drizzle/db";
import {
  SyncLogSelect,
  nomenclatures,
  pricesToNomenclature,
  syncLogs,
} from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1c-adapter";
import { ISyncLogMeta } from "@/lib/common-types";
import { getAllPrices } from "@/lib/odata/prices";

export async function syncPrice({
  priceId,
  forceIncremental,
}: {
  priceId: string;
  forceIncremental?: boolean;
}): Promise<SyncLogSelect> {
  const allPriceData = await getAllPrices(priceId);
  const hashOf1CData = hash(allPriceData).toString();
  const syncResultMeta: ISyncLogMeta = {
    entitiesFrom1C: allPriceData.length,
    entitiesUpdated: 0,
    entitiesIgnored: 0,
    entitiesMarkedDeleted: 0,
    entitiesCreated: 0,
  };

  const lastPriceSync = await db.query.syncLogs.findFirst({
    where: and(eq(syncLogs.type, "prices"), eq(syncLogs.priceId, priceId)),
    orderBy: [desc(syncLogs.createdAt)],
  });

  const latestHash = lastPriceSync?.dataHash;
  if (latestHash && latestHash === hashOf1CData && !forceIncremental) {
    // No changes in the data, no need to sync
    syncResultMeta.entitiesIgnored = allPriceData.length;
    return saveSyncLog({
      hashOf1CData,
      syncMeta: syncResultMeta,
      status: "ignored",
      priceId,
    });
  }

  const allPricesFromDB = await db
    .select({
      priceId: pricesToNomenclature.priceId,
      nomenclatureId: pricesToNomenclature.nomenclatureId,
      price: pricesToNomenclature.price,
      measureUnitId: pricesToNomenclature.measureUnitId,
      updatedAt: pricesToNomenclature.updatedAt,
    })
    .from(pricesToNomenclature)
    .where(eq(pricesToNomenclature.priceId, priceId));

  const allNomenclatureIds = await db
    .select({
      id: nomenclatures.id,
    })
    .from(nomenclatures);

  await db.transaction(async (tx) => {
    const updatePromises: Promise<any>[] = [];
    // Changes in the data, sync the prices
    const pricesFormatted = allPriceData.map((price) =>
      ConvertFrom1C.price(price),
    );
    for (const price of pricesFormatted) {
      const existingPrice = allPricesFromDB.find(
        (dbPrice) => dbPrice.nomenclatureId === price.nomenclatureId,
      );
      if (existingPrice) {
        if (existingPrice.updatedAt < price.period) {
          if (!allNomenclatureIds.find((n) => n.id === price.nomenclatureId)) {
            syncResultMeta.entitiesIgnored++;
            continue;
          }
          updatePromises.push(
            tx
              .update(pricesToNomenclature)
              .set({
                price: price.price,
                measureUnitId: price.measurementUnit,
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(pricesToNomenclature.priceId, priceId),
                  eq(pricesToNomenclature.nomenclatureId, price.nomenclatureId),
                ),
              ),
          );
          syncResultMeta.entitiesUpdated++;
        } else {
          syncResultMeta.entitiesIgnored++;
        }
      } else {
        if (!allNomenclatureIds.find((n) => n.id === price.nomenclatureId)) {
          syncResultMeta.entitiesIgnored++;
          continue;
        }
        updatePromises.push(
          tx.insert(pricesToNomenclature).values({
            priceId,
            nomenclatureId: price.nomenclatureId,
            price: price.price,
            measureUnitId: price.measurementUnit,
          }),
        );
        syncResultMeta.entitiesCreated++;
      }
    }
    // Update the prices inside the transaction
    await Promise.allSettled(updatePromises);
  });

  return saveSyncLog({ hashOf1CData, syncMeta: syncResultMeta, priceId });
}

async function saveSyncLog({
  hashOf1CData,
  syncMeta,
  priceId,
  status = "success",
}: {
  hashOf1CData: string;
  syncMeta: ISyncLogMeta;
  priceId: string;
  status?: "success" | "error" | "ignored";
}): Promise<SyncLogSelect> {
  const syncResultFromDB = await db
    .insert(syncLogs)
    .values({
      dataHash: hashOf1CData,
      type: "prices",
      priceId,
      status,
      metadata: syncMeta,
    })
    .returning();

  if (syncResultFromDB.length === 0) {
    throw new Error("Failed to log sync sync sync result");
  }

  return syncResultFromDB[0];
}

export async function syncAllPrices(): Promise<SyncLogSelect[]> {
  const syncResults: SyncLogSelect[] = [];
  const allPricesInDb = await db.query.prices.findMany({
    columns: {
      id: true,
      name: true,
    },
  });
  for (const price of allPricesInDb) {
    if (price.id) {
      const priceSync = await syncPrice({
        priceId: price.id,
      });
      syncResults.push(priceSync);
    }
  }

  return syncResults;
}
