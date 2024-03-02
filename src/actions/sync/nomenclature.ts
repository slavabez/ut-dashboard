"use server";

import { count, desc, eq } from "drizzle-orm";
import hash from "hash-it";

import { db } from "@/drizzle/db";
import {
  NomenclatureInsert,
  SyncLogSelect,
  nomenclatures,
  syncLogs,
} from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1CAdapter";
import { From1C, IFileFields, Nomenclature1CFields } from "@/lib/odata";
import { separateListIntoLevels as separateArraysByLevel } from "@/lib/utils";

export interface NomenclatureSyncMeta {
  totalFrom1C: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsMarkedDeleted: number;
  itemsIgnored: number;
}

interface SyncResult {
  success: boolean;
  error?: string;
  syncResult?: SyncLogSelect;
}

/**
 * Sync nomenclature types from 1C to the database.
 *
 * @returns Promise<SyncResult>
 */
export async function syncNomenclature(
  forceIncremental = false,
): Promise<SyncResult> {
  try {
    const allNomenclature = await From1C.getAllNomenclatureItems();
    const allNomenclatureFiles = await From1C.getAllNomenclatureFiles();
    // Hash the data to compare with the latest sync log
    const hashOf1CData = hash(allNomenclature).toString();

    const [latestNomSync, totalNomInDb] = await Promise.all([
      db
        .select()
        .from(syncLogs)
        .where(eq(syncLogs.type, "nomenclature"))
        .orderBy(desc(syncLogs.createdAt))
        .limit(1),
      db
        .select({ value: count().mapWith(Number) })
        .from(nomenclatures)
        .then((res) => res[0]?.value || 0),
    ]);

    let syncMeta = {
      totalFrom1C: allNomenclature.length,
      itemsCreated: 0,
      itemsUpdated: 0,
      itemsMarkedDeleted: 0,
      itemsIgnored: 0,
    };

    const latestHash = latestNomSync[0]?.dataHash;
    if (latestHash && latestHash === hashOf1CData && !forceIncremental) {
      // No changes since the last sync, ignore
      syncMeta.itemsIgnored = allNomenclature.length;
      return saveSyncLog(hashOf1CData, syncMeta, "ignored");
    }

    if (totalNomInDb === 0 && !forceIncremental) {
      // Empty database, run the initial sync
      await initialSync(allNomenclature, syncMeta, allNomenclatureFiles);
    } else {
      // Incremental sync, compare and update individually
      await incrementalSync(allNomenclature, syncMeta, allNomenclatureFiles);
    }

    return saveSyncLog(hashOf1CData, syncMeta);
  } catch (e) {
    console.error(e);
    return { success: false, error: "Error while syncing nomenclature" };
  }
}

async function initialSync(
  allItems: Nomenclature1CFields[],
  syncMeta: NomenclatureSyncMeta,
  allNomenclatureFiles: IFileFields[],
) {
  const formattedItems = allItems.map(ConvertFrom1C.nomenclatureItem);
  allNomenclatureFiles.forEach((file) => {
    const item = formattedItems.find((i) => i.id === file.ВладелецФайла_Key);
    if (item) {
      item.coverImage = file.ПутьКФайлу.replace(/\\/g, "/");
    }
  });
  // Too many items to insert at once, split into chunks, in a transaction
  const CHUNK_SIZE = 100;
  await db.transaction(async (tx) => {
    for (let i = 0; i < formattedItems.length; i += CHUNK_SIZE) {
      await tx
        .insert(nomenclatures)
        .values(formattedItems.slice(i, i + CHUNK_SIZE));
    }
  });
  syncMeta.itemsCreated = formattedItems.length;
}

async function incrementalSync(
  allItems: Nomenclature1CFields[],
  syncMeta: NomenclatureSyncMeta,
  allNomenclatureFiles: IFileFields[],
) {
  const formattedItems = allItems.map(ConvertFrom1C.nomenclatureItem);
  allNomenclatureFiles.forEach((file) => {
    const item = formattedItems.find((i) => i.id === file.ВладелецФайла_Key);
    if (item) {
      item.coverImage = file.ПутьКФайлу.replace(/\\/g, "/");
    }
  });
  const separated = separateArraysByLevel(formattedItems);
  const allItemsInDb = await db.select().from(nomenclatures);

  for (const level of separated) {
    for (const nomItem of level.items) {
      const existing = allItemsInDb.find((t) => t.id === nomItem.id);
      if (!existing) {
        await db.insert(nomenclatures).values(nomItem);
        syncMeta.itemsCreated++;
      } else {
        // Check and update only if dataVersion has changed
        if (existing.dataVersion !== nomItem.dataVersion) {
          await db
            .update(nomenclatures)
            .set(nomItem)
            .where(eq(nomenclatures.id, nomItem.id as string));
          syncMeta.itemsUpdated++;
        }
        // Check and update deletion mark, set/unset
        if (nomItem.deletionMark !== existing.deletionMark) {
          await db
            .update(nomenclatures)
            .set({ deletionMark: nomItem.deletionMark })
            .where(eq(nomenclatures.id, nomItem.id as string));
          syncMeta.itemsMarkedDeleted++;
        }
      }
    }
  }
}

async function saveSyncLog(
  hashOf1CData: string,
  syncMeta: NomenclatureSyncMeta,
  status = "success",
) {
  const syncResultFromDB = await db
    .insert(syncLogs)
    .values({
      dataHash: hashOf1CData,
      type: "nomenclature",
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
