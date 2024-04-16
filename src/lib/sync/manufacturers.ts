"use server";

import { count, desc, eq } from "drizzle-orm";
import hash from "hash-it";

import { db } from "@/drizzle/db";
import { SyncLogSelect, manufacturers, syncLogs } from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1c-adapter";
import { ISyncLogMeta } from "@/lib/common-types";
import {
  Manufacturer1CFields,
  getAllManufacturers,
} from "@/lib/odata/nomenclature";

/**
 * Sync manufacturers from 1C to the database.
 *
 * @returns Promise<SyncResult>
 */
export async function syncManufacturers(
  forceIncrement = false,
): Promise<SyncLogSelect> {
  try {
    const allManufacturersRaw = await getAllManufacturers();
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

    let syncMeta: ISyncLogMeta = {
      entitiesFrom1C: allManufacturersRaw.length,
      entitiesCreated: 0,
      entitiesUpdated: 0,
      entitiesMarkedDeleted: 0,
      entitiesIgnored: 0,
    };

    const latestHash = latestManufacturersSync[0]?.dataHash;
    if (latestHash && latestHash === hashOf1CData && !forceIncrement) {
      // No changes since the last sync, ignore
      syncMeta.entitiesIgnored = allManufacturersRaw.length;
      return saveSyncLog(hashOf1CData, syncMeta, "ignored");
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
    throw new Error("Error while syncing manufacturers");
  }
}

async function initialSync(
  allManufacturersRaw: Manufacturer1CFields[],
  syncMeta: ISyncLogMeta,
) {
  const formattedManufacturers = allManufacturersRaw.map(
    ConvertFrom1C.manufacturer,
  );
  await db.insert(manufacturers).values(formattedManufacturers);
  syncMeta.entitiesCreated = formattedManufacturers.length;
}

async function incrementalSync(
  allManufacturersRaw: Manufacturer1CFields[],
  syncMeta: ISyncLogMeta,
) {
  const formattedManufacturers = allManufacturersRaw.map(
    ConvertFrom1C.manufacturer,
  );
  const allManufacturersInDb = await db.select().from(manufacturers);

  for (const manufacturer of formattedManufacturers) {
    const existing = allManufacturersInDb.find((m) => m.id === manufacturer.id);
    if (!existing) {
      await db.insert(manufacturers).values(manufacturer);
      syncMeta.entitiesCreated++;
    } else {
      // Check and update only if dataVersion has changed
      if (existing.dataVersion !== manufacturer.dataVersion) {
        await db
          .update(manufacturers)
          .set(manufacturer)
          .where(eq(manufacturers.id, manufacturer.id as string));
        syncMeta.entitiesUpdated++;
      }
      // Check and update deletion mark, set/unset
      if (manufacturer.deletionMark !== existing.deletionMark) {
        await db
          .update(manufacturers)
          .set({ deletionMark: manufacturer.deletionMark })
          .where(eq(manufacturers.id, manufacturer.id as string));
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
      type: "manufacturers",
      status,
      metadata: syncMeta,
    })
    .returning();

  if (syncResultFromDB.length === 0) {
    throw new Error("Failed to log sync manufacturers result");
  }

  return syncResultFromDB[0];
}
