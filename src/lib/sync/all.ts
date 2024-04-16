"use server";

import { SyncLogSelect } from "@/drizzle/schema";
import { syncManufacturers } from "@/lib/sync/manufacturers";
import { syncMeasurementUnits } from "@/lib/sync/measurement-units";
import { syncNomenclature } from "@/lib/sync/nomenclature";
import { syncNomenclatureTypes } from "@/lib/sync/nomenclature-types";
import { syncAllPrices } from "@/lib/sync/prices";
import { syncStock } from "@/lib/sync/stock";

export const syncAll = async (): Promise<SyncLogSelect[]> => {
  try {
    // Sequentially sync all entities in specific order:
    // 1. Manufacturers
    // 2. Nomenclature types
    // 3. Nomenclature
    // 4. Measurement units
    // 5. Prices
    // 6. Stock
    const syncResults: SyncLogSelect[] = [];
    const manSync = await syncManufacturers();
    const nomTypeSync = await syncNomenclatureTypes();
    const nomSync = await syncNomenclature();
    const unitSync = await syncMeasurementUnits();
    const allPricesSync = await syncAllPrices();
    const stockSync = await syncStock();

    syncResults.push(
      manSync,
      nomTypeSync,
      nomSync,
      unitSync,
      ...allPricesSync,
      stockSync,
    );

    return syncResults;
  } catch (e) {
    console.error(e);
    throw new Error("Error while syncing all items");
  }
};
