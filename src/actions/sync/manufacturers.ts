"use server";

import { count, desc, eq } from "drizzle-orm";
import hash from "hash-it";

import { db } from "@/drizzle/db";
import { SyncLogSelect, manufacturers, syncLogs } from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1CAdapter";
import { From1C, Manufacturer1CFields } from "@/lib/odata";

export interface ManufacturersSyncMeta {
  totalFrom1C: number;
  manufacturersCreated: number;
  manufacturersUpdated: number;
  manufacturersMarkedDeleted: number;
  manufacturersIgnored: number;
}

interface SyncResult {
  success: boolean;
  error?: string;
  syncResult?: SyncLogSelect;
}

/**
 * Sync manufacturers from 1C to the database.
 *
 * @returns Promise<SyncResult>
 */
export async function syncManufacturers(
  forceIncrement = false,
): Promise<SyncResult> {
  try {
    const allManufacturersRaw = await From1C.getAllManufacturers();
    // Hash the data to compare with the latest sync log
    const hashOf1CData = hash(allManufacturersRaw).toString();

    const [latestManufacturersSync, totalManufacturersInDb] = await Promise.all(
      [
        db
          .select()
          .from(syncLogs)
          .where(eq(syncLogs.type, "manufacturers"))
          .orderBy(desc(syncLogs.createdAt))
          .limit(1),
        db
          .select({ value: count().mapWith(Number) })
          .from(manufacturers)
          .then((res) => res[0]?.value || 0),
      ],
    );

    let syncMeta = {
      totalFrom1C: allManufacturersRaw.length,
      manufacturersCreated: 0,
      manufacturersUpdated: 0,
      manufacturersMarkedDeleted: 0,
      manufacturersIgnored: 0,
    };

    const latestHash = latestManufacturersSync[0]?.dataHash;
    if (latestHash && latestHash === hashOf1CData && !forceIncrement) {
      // No changes since the last sync, ignore
      syncMeta.manufacturersIgnored = allManufacturersRaw.length;
      return saveSyncLog(hashOf1CData, syncMeta);
    }

    if (totalManufacturersInDb === 0 && !forceIncrement) {
      // Empty database, run the initial sync
      await initialSync(allManufacturersRaw, syncMeta);
    } else {
      // Incremental sync, compare and update individually
      await incrementalSync(allManufacturersRaw, syncMeta);
    }

    return saveSyncLog(hashOf1CData, syncMeta);
  } catch (e) {
    console.error(e);
    return { success: false, error: "Error while syncing manufacturers" };
  }
}

async function initialSync(
  allManufacturersRaw: Manufacturer1CFields[],
  syncMeta: ManufacturersSyncMeta,
) {
  const formattedManufacturers = allManufacturersRaw.map(
    ConvertFrom1C.manufacturer,
  );
  await db.insert(manufacturers).values(formattedManufacturers);
  syncMeta.manufacturersCreated = formattedManufacturers.length;
}

async function incrementalSync(
  allManufacturersRaw: Manufacturer1CFields[],
  syncMeta: ManufacturersSyncMeta,
) {
  const formattedManufacturers = allManufacturersRaw.map(
    ConvertFrom1C.manufacturer,
  );
  const allManufacturersInDb = await db.select().from(manufacturers);

  for (const manufacturer of formattedManufacturers) {
    const existing = allManufacturersInDb.find((m) => m.id === manufacturer.id);
    if (!existing) {
      await db.insert(manufacturers).values(manufacturer);
      syncMeta.manufacturersCreated++;
    } else {
      // Check and update only if dataVersion has changed
      if (existing.dataVersion !== manufacturer.dataVersion) {
        await db
          .update(manufacturers)
          .set(manufacturer)
          .where(eq(manufacturers.id, manufacturer.id as string));
        syncMeta.manufacturersUpdated++;
      }
      // Check and update deletion mark, set/unset
      if (manufacturer.deletionMark !== existing.deletionMark) {
        await db
          .update(manufacturers)
          .set({ deletionMark: manufacturer.deletionMark })
          .where(eq(manufacturers.id, manufacturer.id as string));
        syncMeta.manufacturersMarkedDeleted++;
      }
    }
  }
}

async function saveSyncLog(
  hashOf1CData: string,
  syncMeta: ManufacturersSyncMeta,
) {
  const syncResultFromDB = await db
    .insert(syncLogs)
    .values({
      dataHash: hashOf1CData,
      type: "manufacturers",
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
