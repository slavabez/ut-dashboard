"use server";

import { revalidatePath } from "next/cache";

import { SyncLogSelect } from "@/drizzle/schema";
import { currentRole } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import { syncMeasurementUnits } from "@/lib/sync/measurement-units";

/**
 * Sync measurement units from 1C to the database.
 *
 * @returns Promise<SyncResult>
 */
export async function syncMeasurementUnitsAction(
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

    const result = await syncMeasurementUnits(forceIncrement);
    revalidatePath("/admin/sync/measurement-units");
    return {
      status: "success",
      data: result,
    };
  } catch (e) {
    console.error(e);
    return { status: "error", error: "Error while syncing measurement units" };
  }
}
