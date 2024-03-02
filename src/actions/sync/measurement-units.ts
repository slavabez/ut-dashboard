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
import { ConvertFrom1C } from "@/lib/1CAdapter";
import { From1C, IUnitFields } from "@/lib/odata";

export interface MeasurementUnitsSyncMeta {
  totalFrom1C: number;
  unitsCreated: number;
  unitsUpdated: number;
  unitsMarkedDeleted: number;
  unitsIgnored: number;
}

interface SyncResult {
  success: boolean;
  error?: string;
  syncResult?: SyncLogSelect;
}

/**
 * Sync measurement units from 1C to the database.
 *
 * @returns Promise<SyncResult>
 */
export async function syncMeasurementUnits(
  forceIncrement = false,
): Promise<SyncResult> {
  try {
    const allMeasurementsRaw = await From1C.getAllMeasurementUnits();
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

    let syncMeta = {
      totalFrom1C: allMeasurementsRaw.length,
      unitsCreated: 0,
      unitsUpdated: 0,
      unitsMarkedDeleted: 0,
      unitsIgnored: 0,
    };

    const latestHash = latestMeasurementUnitsSync[0]?.dataHash;
    if (latestHash && latestHash === hashOf1CData && !forceIncrement) {
      // No changes since the last sync, ignore
      syncMeta.unitsIgnored = allMeasurementsRaw.length;
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
    return { success: false, error: "Error while syncing measurement units" };
  }
}

async function initialSync(
  allUnitsRaw: IUnitFields[],
  syncMeta: MeasurementUnitsSyncMeta,
) {
  const formattedUnits = allUnitsRaw.map(ConvertFrom1C.measurementUnit);
  const CHUNK_SIZE = 100;
  await db.transaction(async (tx) => {
    for (let i = 0; i < formattedUnits.length; i += CHUNK_SIZE) {
      await tx
        .insert(measurementUnits)
        .values(formattedUnits.slice(i, i + CHUNK_SIZE));
    }
  });
  syncMeta.unitsCreated = formattedUnits.length;
}

async function incrementalSync(
  allUnitsRaw: IUnitFields[],
  syncMeta: MeasurementUnitsSyncMeta,
) {
  const formattedUnits = allUnitsRaw.map(ConvertFrom1C.measurementUnit);
  const allUnitsInDb = await db.select().from(measurementUnits);

  for (const unit of formattedUnits) {
    const existing = allUnitsInDb.find((m) => m.id === unit.id);
    if (!existing) {
      await db.insert(measurementUnits).values(unit);
      syncMeta.unitsCreated++;
    } else {
      // Check and update only if dataVersion has changed
      if (existing.dataVersion !== unit.dataVersion) {
        await db
          .update(measurementUnits)
          .set(unit)
          .where(eq(measurementUnits.id, unit.id as string));
        syncMeta.unitsUpdated++;
      }
      // Check and update deletion mark, set/unset
      if (unit.deletionMark !== existing.deletionMark) {
        await db
          .update(measurementUnits)
          .set({ deletionMark: unit.deletionMark })
          .where(eq(measurementUnits.id, unit.id as string));
        syncMeta.unitsMarkedDeleted++;
      }
    }
  }
}

async function saveSyncLog(
  hashOf1CData: string,
  syncMeta: MeasurementUnitsSyncMeta,
  status = "success",
) {
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
