"use server";

import { revalidatePath } from "next/cache";

import { SyncLogSelect } from "@/drizzle/schema";
import { currentRole } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import { syncStock } from "@/lib/sync/stock";

export async function syncStockAction(
  forceIncremental = false,
): Promise<IActionResponse<SyncLogSelect>> {
  try {
    const role = await currentRole();

    if (role !== "admin") {
      return {
        status: "error",
        error: "У вас недостаточно прав для этого действия",
      };
    }

    const result = await syncStock(forceIncremental);
    revalidatePath("/admin/sync/stock");
    return {
      status: "success",
      data: result,
    };
  } catch (e) {
    console.error("Error while syncing prices", e);
    return {
      status: "error",
      error: "Error while syncing prices",
    };
  }
}
