"use server";

import { and, desc, eq } from "drizzle-orm";
import hash from "hash-it";
import { revalidatePath } from "next/cache";

import { db } from "@/drizzle/db";
import {
  SyncLogSelect,
  nomenclatures,
  pricesToNomenclature,
  syncLogs,
} from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1c-adapter";
import { currentRole } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import { From1C } from "@/lib/odata";
import { ISyncLogMeta } from "@/lib/sync";

export async function syncPrice({
  priceId,
  forceIncremental,
}: {
  priceId: string;
  forceIncremental?: boolean;
}): Promise<IActionResponse<SyncLogSelect>> {
  try {
    const role = await currentRole();

    if (role !== "admin") {
      return {
        status: "error",
        error: "У вас недостаточно прав для этого действия",
      };
    }

    const allPriceData = await From1C.getAllPrices(priceId);
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
            if (
              !allNomenclatureIds.find((n) => n.id === price.nomenclatureId)
            ) {
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
                    eq(
                      pricesToNomenclature.nomenclatureId,
                      price.nomenclatureId,
                    ),
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
  } catch (e) {
    console.error("Error while syncing prices", e);
    return {
      status: "error",
      error: "Error while syncing prices",
    };
  }
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
}): Promise<IActionResponse<SyncLogSelect>> {
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
    return {
      status: "error",
      error: "Failed to log sync result",
    };
  }

  revalidatePath("/admin/prices");

  return {
    status: "success",
    data: syncResultFromDB[0],
  };
}
