"use server";

import { count, desc, eq } from "drizzle-orm";
import hash from "hash-it";

import { db } from "@/drizzle/db";
import { SyncLogSelect, nomenclatures, syncLogs } from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1c-adapter";
import { ISyncLogMeta } from "@/lib/common-types";
import {
  IFileFields,
  Nomenclature1CFields,
  getAllNomenclatureFiles,
  getAllNomenclatureItems,
} from "@/lib/odata/nomenclature";
import { getLatestSiteSettings } from "@/lib/site-settings";
import { separateListIntoLevels as separateArraysByLevel } from "@/lib/utils";

/**
 * Sync nomenclature types from 1C to the database.
 *
 * @returns Promise<SyncResult>
 */
export async function syncNomenclature(
  forceIncremental = false,
): Promise<SyncLogSelect> {
  try {
    const allNomenclature = await getAllNomenclatureItems();
    const allNomenclatureFiles = await getAllNomenclatureFiles();
    // Hash the data to compare with the latest sync log
    const hashOf1CData = hash({
      allNomenclature,
      allNomenclatureFiles,
    }).toString();

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

    let syncMeta: ISyncLogMeta = {
      entitiesFrom1C: allNomenclature.length,
      entitiesCreated: 0,
      entitiesUpdated: 0,
      entitiesMarkedDeleted: 0,
      entitiesIgnored: 0,
    };

    const latestHash = latestNomSync[0]?.dataHash;
    if (latestHash && latestHash === hashOf1CData && !forceIncremental) {
      // No changes since the last sync, ignore
      syncMeta.entitiesIgnored = allNomenclature.length;
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
    throw new Error("Error while syncing nomenclature");
  }
}

async function initialSync(
  allItems: Nomenclature1CFields[],
  syncMeta: ISyncLogMeta,
  allNomenclatureFiles: IFileFields[],
) {
  const siteSettings = await getLatestSiteSettings();
  const formattedItems = await Promise.all(
    allItems.map((ni) => ConvertFrom1C.nomenclatureItem(ni, siteSettings)),
  );
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
  syncMeta.entitiesCreated = formattedItems.length;
}

async function incrementalSync(
  allItems: Nomenclature1CFields[],
  syncMeta: ISyncLogMeta,
  allNomenclatureFiles: IFileFields[],
) {
  const siteSettings = await getLatestSiteSettings();
  const formattedItems = await Promise.all(
    allItems.map((ni) => ConvertFrom1C.nomenclatureItem(ni, siteSettings)),
  );
  allNomenclatureFiles.forEach((file) => {
    const item = formattedItems.find((i) => i.id === file.ВладелецФайла_Key);
    if (item) {
      item.coverImage = file.ПутьКФайлу.replace(/\\/g, "/");
    }
  });
  // Separate by levels, because children cannot be inserted before the parent exists
  // Parentless (root level) items are inserted first
  const separated = separateArraysByLevel(formattedItems);
  const allItemsInDb = await db.select().from(nomenclatures);

  for (const level of separated) {
    for (const nomItem of level.items) {
      const existing = allItemsInDb.find((t) => t.id === nomItem.id);
      if (!existing) {
        await db.insert(nomenclatures).values(nomItem);
        syncMeta.entitiesCreated++;
      } else {
        // Check and update only if dataVersion has changed or new cover image has been set
        if (existing.dataVersion !== nomItem.dataVersion) {
          await db
            .update(nomenclatures)
            .set(nomItem)
            .where(eq(nomenclatures.id, nomItem.id as string));
          syncMeta.entitiesUpdated++;
        }
        // Check and update deletion mark, set/unset
        if (nomItem.deletionMark !== existing.deletionMark) {
          await db
            .update(nomenclatures)
            .set({ deletionMark: nomItem.deletionMark })
            .where(eq(nomenclatures.id, nomItem.id as string));
          syncMeta.entitiesMarkedDeleted++;
        }
      }
    }
  }
}

async function saveSyncLog(
  hashOf1CData: string,
  syncMeta: ISyncLogMeta,
  status = "success",
): Promise<SyncLogSelect> {
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
    throw new Error("Failed to log sync sync result");
  }

  return syncResultFromDB[0];
}
