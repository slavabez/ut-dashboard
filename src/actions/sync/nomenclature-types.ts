"use server";

import { count, desc, eq } from "drizzle-orm";
import hash from "hash-it";

import { db } from "@/drizzle/db";
import { SyncLogSelect, nomenclatureTypes, syncLogs } from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1c-adapter";
import { currentRole } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import { From1C, NomenclatureType1CFields } from "@/lib/odata";
import { ISyncLogMeta } from "@/lib/sync";
import { separateListIntoLevels as separateArraysByLevel } from "@/lib/utils";

/**
 * Sync nomenclature types from 1C to the database.
 *
 * @returns Promise<SyncResult>
 */
export async function syncNomenclatureTypes(
  forceIncrement = false,
): Promise<IActionResponse<SyncLogSelect>> {
  try {
    const role = await currentRole();

    if (role !== "admin") {
      return {
        status: "error",
        error: "У вас недостаточно прав для этого действия",
      };
    }

    const allTypes = await From1C.getAllNomenclatureTypes();
    // Hash the data to compare with the latest sync log
    const hashOf1CData = hash(allTypes).toString();

    const [latestNomTypesSync, totalTypesInDb] = await Promise.all([
      db
        .select()
        .from(syncLogs)
        .where(eq(syncLogs.type, "nomenclature-types"))
        .orderBy(desc(syncLogs.createdAt))
        .limit(1),
      db
        .select({ value: count().mapWith(Number) })
        .from(nomenclatureTypes)
        .then((res) => res[0]?.value || 0),
    ]);

    let syncMeta: ISyncLogMeta = {
      entitiesFrom1C: allTypes.length,
      entitiesCreated: 0,
      entitiesUpdated: 0,
      entitiesMarkedDeleted: 0,
      entitiesIgnored: 0,
    };

    const latestHash = latestNomTypesSync[0]?.dataHash;
    if (latestHash && latestHash === hashOf1CData && !forceIncrement) {
      // No changes since the last sync, ignore
      syncMeta.entitiesIgnored = allTypes.length;
      return saveSyncLog(hashOf1CData, syncMeta, "ignored");
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
    return { status: "error", error: "Error while syncing nomenclature types" };
  }
}

async function initialSync(
  allTypes: NomenclatureType1CFields[],
  syncMeta: ISyncLogMeta,
) {
  const formattedTypes = allTypes.map(ConvertFrom1C.nomenclatureType);
  await db.insert(nomenclatureTypes).values(formattedTypes);
  syncMeta.entitiesCreated = formattedTypes.length;
}

async function incrementalSync(
  allTypes: NomenclatureType1CFields[],
  syncMeta: ISyncLogMeta,
) {
  const formattedTypes = allTypes.map(ConvertFrom1C.nomenclatureType);
  const separated = separateArraysByLevel(formattedTypes);
  const allTypesInDb = await db.select().from(nomenclatureTypes);

  for (const level of separated) {
    for (const nomType of level.items) {
      const existing = allTypesInDb.find((t) => t.id === nomType.id);
      if (!existing) {
        await db.insert(nomenclatureTypes).values(nomType);
        syncMeta.entitiesCreated++;
      } else {
        // Check and update only if dataVersion has changed
        if (existing.dataVersion !== nomType.dataVersion) {
          await db
            .update(nomenclatureTypes)
            .set(nomType)
            .where(eq(nomenclatureTypes.id, nomType.id as string));
          syncMeta.entitiesUpdated++;
        }
        // Check and update deletion mark, set/unset
        if (nomType.deletionMark !== existing.deletionMark) {
          await db
            .update(nomenclatureTypes)
            .set({ deletionMark: nomType.deletionMark })
            .where(eq(nomenclatureTypes.id, nomType.id as string));
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
): Promise<IActionResponse<SyncLogSelect>> {
  const syncResultFromDB = await db
    .insert(syncLogs)
    .values({
      dataHash: hashOf1CData,
      type: "nomenclature-types",
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
