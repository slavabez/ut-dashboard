"use server";

import { count, desc, eq } from "drizzle-orm";
import hash from "hash-it";

import { db } from "@/drizzle/db";
import { SyncLogSelect, nomenclatureTypes, syncLogs } from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1CAdapter";
import { From1C, NomenclatureType1CFields } from "@/lib/odata";
import { separateListIntoLevels as separateArraysByLevel } from "@/lib/utils";

export interface NomenclatureTypesSyncMeta {
  totalFrom1C: number;
  typesCreated: number;
  typesUpdated: number;
  typesMarkedDeleted: number;
  typesIgnored: number;
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
export async function syncNomenclatureTypes(
  forceIncrement = false,
): Promise<SyncResult> {
  try {
    const allTypes = await From1C.getAllNomenclatureTypes();
    // Hash the data to compare with the latest sync log
    const hashOf1CData = hash(allTypes).toString();

    const [latestNomTypesSync, totalTypesInDb] = await Promise.all([
      db
        .select()
        .from(syncLogs)
        .where(eq(syncLogs.type, "nomenclatureTypes"))
        .orderBy(desc(syncLogs.createdAt))
        .limit(1),
      db
        .select({ value: count().mapWith(Number) })
        .from(nomenclatureTypes)
        .then((res) => res[0]?.value || 0),
    ]);

    let syncMeta = {
      totalFrom1C: allTypes.length,
      typesCreated: 0,
      typesUpdated: 0,
      typesMarkedDeleted: 0,
      typesIgnored: 0,
    };

    const latestHash = latestNomTypesSync[0]?.dataHash;
    if (latestHash && latestHash === hashOf1CData && !forceIncrement) {
      // No changes since the last sync, ignore
      syncMeta.typesIgnored = allTypes.length;
      return saveSyncLog(hashOf1CData, syncMeta);
    }

    if (totalTypesInDb === 0 && !forceIncrement) {
      // Empty database, run the initial sync
      await initialSync(allTypes, syncMeta);
    } else {
      // Incremental sync, compare and update individually
      await incrementalSync(allTypes, syncMeta);
    }

    return saveSyncLog(hashOf1CData, syncMeta);
  } catch (e) {
    console.error(e);
    return { success: false, error: "Error while syncing nomenclature types" };
  }
}

async function initialSync(
  allTypes: NomenclatureType1CFields[],
  syncMeta: NomenclatureTypesSyncMeta,
) {
  const formattedTypes = allTypes.map(ConvertFrom1C.nomenclatureType);
  await db.insert(nomenclatureTypes).values(formattedTypes);
  syncMeta.typesCreated = formattedTypes.length;
}

async function incrementalSync(
  allTypes: NomenclatureType1CFields[],
  syncMeta: NomenclatureTypesSyncMeta,
) {
  const formattedTypes = allTypes.map(ConvertFrom1C.nomenclatureType);
  const separated = separateArraysByLevel(formattedTypes);
  const allTypesInDb = await db.select().from(nomenclatureTypes);

  for (const level of separated) {
    for (const nomType of level.items) {
      const existing = allTypesInDb.find((t) => t.id === nomType.id);
      if (!existing) {
        await db.insert(nomenclatureTypes).values(nomType);
        syncMeta.typesCreated++;
      } else {
        // Check and update only if dataVersion has changed
        if (existing.dataVersion !== nomType.dataVersion) {
          await db
            .update(nomenclatureTypes)
            .set(nomType)
            .where(eq(nomenclatureTypes.id, nomType.id as string));
          syncMeta.typesUpdated++;
        }
        // Check and update deletion mark, set/unset
        if (nomType.deletionMark !== existing.deletionMark) {
          await db
            .update(nomenclatureTypes)
            .set({ deletionMark: nomType.deletionMark })
            .where(eq(nomenclatureTypes.id, nomType.id as string));
          syncMeta.typesMarkedDeleted++;
        }
      }
    }
  }
}

async function saveSyncLog(
  hashOf1CData: string,
  syncMeta: NomenclatureTypesSyncMeta,
) {
  const syncResultFromDB = await db
    .insert(syncLogs)
    .values({
      dataHash: hashOf1CData,
      type: "nomenclatureTypes",
      status: "success",
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
