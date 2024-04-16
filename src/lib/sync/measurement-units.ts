"use server";

import { count, desc, eq } from "drizzle-orm";
import hash from "hash-it";

import { db } from "@/drizzle/db";
import {
  SyncLogSelect,
  measurementUnits,
  nomenclatures,
  syncLogs,
} from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1c-adapter";
import { ISyncLogMeta } from "@/lib/common-types";
import { IUnitFields, getAllMeasurementUnits } from "@/lib/odata/nomenclature";

/**
 * Sync measurement units from 1C to the database.
 *
 * @returns Promise<SyncResult>
 */
export async function syncMeasurementUnits(
  forceIncrement = false,
): Promise<SyncLogSelect> {
  try {
    const allMeasurementsRaw = await getAllMeasurementUnits();
    // Hash the data to compare with the latest sync log
    const hashOf1CData = hash(allMeasurementsRaw).toString();

    const [latestMeasurementUnitsSync, totalMeasurementUnitsInDb] =
      await Promise.all([
        db
          .select()
          .from(syncLogs)
          .where(eq(syncLogs.type, "measurement-units"))
          .orderBy(desc(syncLogs.createdAt))
          .limit(1),
        db
          .select({ value: count().mapWith(Number) })
          .from(measurementUnits)
          .then((res) => res[0]?.value || 0),
      ]);

    let syncMeta: ISyncLogMeta = {
      entitiesFrom1C: allMeasurementsRaw.length,
      entitiesCreated: 0,
      entitiesUpdated: 0,
      entitiesMarkedDeleted: 0,
      entitiesIgnored: 0,
    };

    const latestHash = latestMeasurementUnitsSync[0]?.dataHash;
    if (latestHash && latestHash === hashOf1CData && !forceIncrement) {
      // No changes since the last sync, ignore
      syncMeta.entitiesIgnored = allMeasurementsRaw.length;
      return saveSyncLog(hashOf1CData, syncMeta, "ignored");
    }

    // Ignore units that do not have a nomenclature id
    const allNomenclatureIds = await db
      .select({
        id: nomenclatures.id,
      })
      .from(nomenclatures);

    const nomenclatureIds = allNomenclatureIds.map((n) => n.id);

    const filtered = allMeasurementsRaw.filter((m) =>
      nomenclatureIds.includes(m.Owner),
    );

    if (totalMeasurementUnitsInDb === 0 && !forceIncrement) {
      // Empty database, run the initial sync
      await initialSync(filtered, syncMeta);
    } else {
      // Incremental sync, compare and update individually
      await incrementalSync(filtered, syncMeta);
    }

    return saveSyncLog(hashOf1CData, syncMeta);
  } catch (e) {
    console.error(e);
    throw new Error("Error while syncing measurement units");
  }
}

async function initialSync(allUnitsRaw: IUnitFields[], syncMeta: ISyncLogMeta) {
  const formattedUnits = allUnitsRaw.map(ConvertFrom1C.measurementUnit);
  const CHUNK_SIZE = 100;
  await db.transaction(async (tx) => {
    for (let i = 0; i < formattedUnits.length; i += CHUNK_SIZE) {
      await tx
        .insert(measurementUnits)
        .values(formattedUnits.slice(i, i + CHUNK_SIZE));
    }
  });
  syncMeta.entitiesCreated = formattedUnits.length;
}

async function incrementalSync(
  allUnitsRaw: IUnitFields[],
  syncMeta: ISyncLogMeta,
) {
  const formattedUnits = allUnitsRaw.map(ConvertFrom1C.measurementUnit);
  const allUnitsInDb = await db.select().from(measurementUnits);

  for (const unit of formattedUnits) {
    const existing = allUnitsInDb.find((m) => m.id === unit.id);
    if (!existing) {
      await db.insert(measurementUnits).values(unit);
      syncMeta.entitiesCreated++;
    } else {
      // Check and update only if dataVersion has changed
      if (existing.dataVersion !== unit.dataVersion) {
        await db
          .update(measurementUnits)
          .set(unit)
          .where(eq(measurementUnits.id, unit.id as string));
        syncMeta.entitiesUpdated++;
      }
      // Check and update deletion mark, set/unset
      if (unit.deletionMark !== existing.deletionMark) {
        await db
          .update(measurementUnits)
          .set({ deletionMark: unit.deletionMark })
          .where(eq(measurementUnits.id, unit.id as string));
        syncMeta.entitiesMarkedDeleted++;
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
      type: "measurement-units",
      status,
      metadata: syncMeta,
    })
    .returning();

  if (syncResultFromDB.length === 0) {
    throw new Error("Failed to log sync result");
  }

  return syncResultFromDB[0];
}
