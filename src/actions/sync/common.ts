"use server";

import { revalidatePath } from "next/cache";

import { syncManufacturers } from "@/actions/sync/manufacturers";
import { syncMeasurementUnits } from "@/actions/sync/measurement-units";
import { syncNomenclature } from "@/actions/sync/nomenclature";
import { syncNomenclatureTypes } from "@/actions/sync/nomenclature-types";
import { syncPrice } from "@/actions/sync/prices";
import { syncStock } from "@/actions/sync/stock";
import { db } from "@/drizzle/db";
import { SyncLogSelect } from "@/drizzle/schema";
import { currentRole } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import { getLatestSyncs, getSyncCount } from "@/lib/sync";

export const getLatestSyncLogs = async ({
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

export const getTotalSyncLogs = async (
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

export const syncAll = async (): Promise<IActionResponse<SyncLogSelect[]>> => {
  try {
    const role = await currentRole();

    if (role !== "admin") {
      return {
        status: "error",
        error: "У вас недостаточно прав для этого действия",
      };
    }
    // Sequentially sync all entities in specific order:
    // 1. Manufacturers
    // 2. Nomenclature types
    // 3. Nomenclature
    // 4. Measurement units
    // 5. Prices
    // 6. Stock
    const syncResults: SyncLogSelect[] = [];
    const manSync = await syncManufacturers();
    if (manSync.status === "success") {
      syncResults.push(manSync.data);
    } else {
      throw new Error("Error while syncing manufacturers");
    }
    const nomTypeSync = await syncNomenclatureTypes();
    if (nomTypeSync.status === "success") {
      syncResults.push(nomTypeSync.data);
    } else {
      throw new Error("Error while syncing nomenclature types");
    }
    const nomSync = await syncNomenclature();
    if (nomSync.status === "success") {
      syncResults.push(nomSync.data);
    } else {
      throw new Error("Error while syncing nomenclature");
    }
    const unitSync = await syncMeasurementUnits();
    if (unitSync.status === "success") {
      syncResults.push(unitSync.data);
    } else {
      throw new Error("Error while syncing measurement units");
    }

    const allPricesInDb = await db.query.prices.findMany({
      columns: {
        id: true,
        name: true,
      },
    });
    for (const price of allPricesInDb) {
      if (price.id) {
        const priceSync = await syncPrice({
          priceId: price.id,
        });
        if (priceSync.status === "success") {
          syncResults.push(priceSync.data);
        } else {
          throw new Error(`Error while syncing the ${price.name} price`);
        }
      }
    }

    const stockSync = await syncStock();
    if (stockSync.status === "success") {
      syncResults.push(stockSync.data);
    } else {
      throw new Error("Error while syncing stock");
    }

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
