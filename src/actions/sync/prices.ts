"use server";

import { revalidatePath } from "next/cache";

import { SyncLogSelect } from "@/drizzle/schema";
import { currentRole } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import { syncAllPrices, syncPrice } from "@/lib/sync/prices";

export async function syncPriceAction({
  priceId,
  forceIncremental,
}: {
  priceId: string;
  forceIncremental?: boolean;
}): Promise<IActionResponse<SyncLogSelect>> {
  try {
    const role = await currentRole();

    if (role !== "admin") {
      return {
        status: "error",
        error: "У вас недостаточно прав для этого действия",
      };
    }

    const result = await syncPrice({
      priceId,
      forceIncremental,
    });
    revalidatePath("/admin/prices");

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

export async function syncAllPricesAction(): Promise<
  IActionResponse<SyncLogSelect[]>
> {
  try {
    const role = await currentRole();
    if (role !== "admin") {
      return {
        status: "error",
        error: "У вас недостаточно прав для этого действия",
      };
    }
    const syncResults = await syncAllPrices();
    revalidatePath("/admin/sync/prices");

    return {
      status: "success",
      data: syncResults,
    };
  } catch (e) {
    console.error(e);
    return {
      status: "error",
      error: "An error occurred while doing the full sync",
    };
  }
}
