"use server";

import { revalidatePath } from "next/cache";

import { SyncLogSelect } from "@/drizzle/schema";
import { currentRole } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import { syncManufacturers } from "@/lib/sync/manufacturers";

/**
 * Sync manufacturers from 1C to the database.
 *
 * @returns Promise<SyncResult>
 */
export async function syncManufacturersAction(
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

    const result = await syncManufacturers(forceIncrement);
    revalidatePath("/admin/sync/manufacturers");
    return {
      status: "success",
      data: result,
    };
  } catch (e) {
    console.error(e);
    return { status: "error", error: "Error while syncing manufacturers" };
  }
}
