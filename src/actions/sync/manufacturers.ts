"use server";

import { count, desc, eq } from "drizzle-orm";
import hash from "hash-it";
import { revalidatePath } from "next/cache";

import { db } from "@/drizzle/db";
import { SyncLogSelect, manufacturers, syncLogs } from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1c-adapter";
import { currentRole } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import { From1C, Manufacturer1CFields } from "@/lib/odata";
import { ISyncLogMeta } from "@/lib/sync";

/**
 * Sync manufacturers from 1C to the database.
 *
 * @returns Promise<SyncResult>
 */
export async function syncManufacturers(
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
    return { status: "error", error: "Error while syncing manufacturers" };
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
): Promise<IActionResponse<SyncLogSelect>> {
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
    return {
      status: "error",
      error: "Failed to log sync result",
    };
  }

  revalidatePath("/admin/sync/manufacturers");

  return {
    status: "success",
    data: syncResultFromDB[0],
  };
}
