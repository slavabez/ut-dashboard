"use server";

import { revalidatePath } from "next/cache";

import { SyncLogSelect } from "@/drizzle/schema";
import { currentRole } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import { getLatestSyncs, getSyncCount } from "@/lib/sync";
import { syncAll } from "@/lib/sync/all";

export const getLatestSyncLogsAction = async ({
  limit,
  offset,
  type,
}: {
  limit: number;
  offset: number;
  type?: string;
}): Promise<IActionResponse<any[]>> => {
  try {
    const role = await currentRole();

    if (role !== "admin") {
      return {
        status: "error",
        error: "У вас недостаточно прав для этого действия",
      };
    }
    const latest = await getLatestSyncs({
      limit,
      offset,
      type,
    });
    return {
      status: "success",
      data: latest,
    };
  } catch (e) {
    return {
      status: "error",
      error: "An error occurred",
    };
  }
};

export const getTotalSyncLogsAction = async (
  type?: string,
): Promise<IActionResponse<number>> => {
  try {
    const role = await currentRole();

    if (role !== "admin") {
      return {
        status: "error",
        error: "У вас недостаточно прав для этого действия",
      };
    }
    const count = await getSyncCount(type);
    return {
      status: "success",
      data: count,
    };
  } catch (e) {
    return {
      status: "error",
      error: "An error occurred",
    };
  }
};

export const syncAllAction = async (): Promise<
  IActionResponse<SyncLogSelect[]>
> => {
  try {
    const role = await currentRole();

    if (role !== "admin") {
      return {
        status: "error",
        error: "У вас недостаточно прав для этого действия",
      };
    }
    const syncResults = await syncAll();

    revalidatePath("/admin/sync");

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
};
