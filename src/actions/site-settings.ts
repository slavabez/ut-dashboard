"use server";

import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

import { db } from "@/drizzle/db";
import {
  PriceInsert,
  PriceSelect,
  SettingsSelect,
  prices,
  siteSettings,
  syncLogs,
  users,
} from "@/drizzle/schema";
import { currentRole } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import { From1C } from "@/lib/odata";

export interface ISiteSettings {
  guidsForSync?: {
    warehouse?: string;
    showManufacturerOrder?: string;
    user?: {
      showOnSite?: string;
      sitePassword?: string;
      siteRole?: string;
      siteRoleAdminValue?: string;
      siteRoleEmployeeValue?: string;
    };
    nomenclature?: {
      minimumNonDivisibleWeight?: string;
      showOnSite?: string;
    };
    units?: {
      kilogram?: string;
      piece?: string;
    };
  };
}

export interface ISiteSettingsExact {
  guidsForSync: {
    warehouse: string;
    showManufacturerOrder: string;
    user: {
      showOnSite: string;
      sitePassword: string;
      siteRole: string;
      siteRoleAdminValue: string;
      siteRoleEmployeeValue: string;
    };
    nomenclature: {
      minimumNonDivisibleWeight: string;
      showOnSite: string;
    };
    units: {
      kilogram: string;
      piece: string;
    };
  };
}

async function getLatestSettingsFromDb(): Promise<SettingsSelect> {
  const settings = await db
    .select()
    .from(siteSettings)
    .orderBy(desc(siteSettings.createdAt))
    .limit(1);
  console.log("Fetched the latest global site settings");

  if (settings.length === 0) {
    throw new Error("No settings found");
  }
  return settings[0];
}

const getCachedSettings = unstable_cache(
  getLatestSettingsFromDb,
  ["site-settings"],
  {
    tags: ["site-settings"],
  },
);

export async function getLatestSiteSettings(): Promise<
  IActionResponse<SettingsSelect>
> {
  try {
    const latestSettings = await getCachedSettings();

    return {
      status: "success",
      data: latestSettings,
    };
  } catch (e: any) {
    return {
      status: "error",
      error: typeof e === "string" ? e : e.message,
    };
  }
}

export async function getGlobalSettings(): Promise<ISiteSettingsExact> {
  const res = await getLatestSiteSettings();
  if (res.status === "error") {
    throw new Error(res.error);
  }
  // Make sure all fields are present or throw an error
  const settings = res.data.settings as ISiteSettings;
  const guids = settings.guidsForSync;
  if (!guids) {
    throw new Error("No guids found in the settings");
  }
  if (!guids.warehouse) {
    throw new Error("No warehouse guid found in the settings");
  }
  if (!guids.user) {
    throw new Error("No user guids found in the settings");
  }
  if (!guids.user.showOnSite) {
    throw new Error("No user.showOnSite guid found in the settings");
  }
  if (!guids.user.sitePassword) {
    throw new Error("No user.sitePassword guid found in the settings");
  }
  if (!guids.user.siteRole) {
    throw new Error("No user.siteRole guid found in the settings");
  }
  if (!guids.user.siteRoleAdminValue) {
    throw new Error("No user.siteRoleAdminValue guid found in the settings");
  }
  if (!guids.user.siteRoleEmployeeValue) {
    throw new Error("No user.siteRoleEmployeeValue guid found in the settings");
  }
  if (!guids.nomenclature) {
    throw new Error("No nomenclature guids found in the settings");
  }
  if (!guids.nomenclature.minimumNonDivisibleWeight) {
    throw new Error(
      "No nomenclature.minimumNonDivisibleWeight guid found in the settings",
    );
  }
  if (!guids.nomenclature.showOnSite) {
    throw new Error("No nomenclature.showOnSite guid found in the settings");
  }
  if (!guids.units) {
    throw new Error("No units guids found in the settings");
  }
  if (!guids.units.kilogram) {
    throw new Error("No units.kilogram guid found in the settings");
  }
  if (!guids.units.piece) {
    throw new Error("No units.piece guid found in the settings");
  }
  return settings as ISiteSettingsExact;
}

export async function saveSiteSettings(
  settings: ISiteSettings,
): Promise<IActionResponse<SettingsSelect>> {
  const role = await currentRole();

  if (role !== "admin") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }

  const newSettings = await db
    .insert(siteSettings)
    .values({
      settings: settings,
    })
    .returning();

  revalidateTag("site-settings");

  return {
    status: "success",
    data: newSettings[0],
  };
}

async function getGuidsRaw() {
  const warehouses = await From1C.getAllWarehouses();
  const priceTypes = await From1C.getAllPriceTypes();
  const additionalProperties = await From1C.getAllAdditionalProperties();
  const mainUnits = await From1C.getMainUnits();
  const propertyValues = await From1C.getAllPropertyValues();

  return {
    warehouses,
    priceTypes,
    additionalProperties,
    mainUnits,
    propertyValues,
  };
}

export async function getGuidsFrom1C(): Promise<IActionResponse<any>> {
  const role = await currentRole();

  if (role !== "admin") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }

  try {
    const guids = await getGuidsRaw();

    return {
      status: "success",
      data: guids,
    };
  } catch (e) {
    return {
      status: "error",
      error: "An error occurred",
    };
  }
}

export async function getPricesWithLatestSyncTime(): Promise<
  IActionResponse<
    {
      priceId: string;
      name: string;
      description: string;
      code: string;
      currency: string;
      priceCreatedAt: Date;
      priceUpdatedAt: Date;
      latestSyncCreatedAt: Date | null;
    }[]
  >
> {
  const pricesWithLatestSync = await db.execute(sql`
      WITH LatestSyncLogs AS (
          SELECT
              ${syncLogs.priceId} as price_id,
              MAX(${syncLogs.updatedAt}) AS latest_updated_at
          FROM
              ${syncLogs}
          GROUP BY
              ${syncLogs.priceId}
      )
      SELECT
          p.id AS price_id,
          p.name,
          p.description,
          p.code,
          p.currency,
          p.created_at AS price_created_at,
          p.updated_at AS price_updated_at,
          sl.created_at AS latest_sync_created_at
      FROM
          ${prices} p
              LEFT JOIN LatestSyncLogs lsl ON p.id = lsl.price_id
              LEFT JOIN ${syncLogs} sl ON sl.price_id = lsl.price_id AND sl.updated_at = lsl.latest_updated_at
      ORDER BY
          p.updated_at DESC;
`);

  return {
    status: "success",
    data: pricesWithLatestSync.map((i) => ({
      priceId: i.price_id as string,
      name: i.name as string,
      description: i.description as string,
      code: i.code as string,
      currency: i.currency as string,
      priceCreatedAt: i.price_created_at as Date,
      priceUpdatedAt: i.price_updated_at as Date,
      latestSyncCreatedAt: i.latest_sync_created_at as Date,
    })),
  };
}

export async function addNewPriceToDb(
  priceInput: PriceInsert,
): Promise<IActionResponse<PriceSelect>> {
  const role = await currentRole();

  if (role !== "admin") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }

  const newPrice = await db.insert(prices).values(priceInput).returning();

  revalidatePath("/admin/prices");

  return {
    status: "success",
    data: newPrice[0],
  };
}

export async function deletePriceFromDb(
  priceId: string,
): Promise<IActionResponse<any>> {
  const role = await currentRole();

  if (role !== "admin") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }

  await db.delete(prices).where(eq(prices.id, priceId));

  revalidatePath("/admin/prices");

  return {
    status: "success",
    data: "Цена успешно удалена",
  };
}

export async function invalidateSiteSettingsCache() {
  revalidateTag("site-settings");
}

/**
 * Check if the site has been initialized.
 * Checks if there are any site settings in the database.
 * If none, check if there are any admin level users
 *
 */
export async function checkInit(): Promise<IActionResponse<string>> {
  const adminCount = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);
  if (adminCount.length === 0) {
    return {
      status: "success",
      data: "Сайт не настроен",
    };
  }
  return {
    status: "error",
    error: "Сайт уже настроен",
  };
}

export async function initialiseSite(): Promise<IActionResponse<any>> {
  const initSettings = await assignInitialSiteSettings();

  if (initSettings.status === "success") {
    return {
      status: "success",
      data: "Сайт успешно настроен",
    };
  }

  return {
    status: "error",
    error: initSettings.error,
  };
}

export async function assignInitialSiteSettings(): Promise<
  IActionResponse<string>
> {
  const settings = await db
    .select()
    .from(siteSettings)
    .orderBy(desc(siteSettings.createdAt))
    .limit(1);

  if (settings.length > 0) {
    return {
      status: "error",
      error: "Настройки уже установлены",
    };
  }

  const initialSettings = {
    guidsForSync: {
      warehouse: "",
      showManufacturerOrder: "",
      user: {
        showOnSite: "",
        sitePassword: "",
        siteRole: "",
        siteRoleAdminValue: "",
        siteRoleEmployeeValue: "",
      },
      nomenclature: {
        minimumNonDivisibleWeight: "",
        showOnSite: "",
      },
      units: {
        kilogram: "",
        piece: "",
      },
    },
  };

  const {
    additionalProperties,
    mainUnits,
    propertyValues,
    warehouses,
    priceTypes,
  } = await getGuidsRaw();

  const mainWarehouse = warehouses.find((w) =>
    w.Description.startsWith("Основной склад (Кокшетау)"),
  );
  if (mainWarehouse)
    initialSettings.guidsForSync.warehouse = mainWarehouse.Ref_Key;

  const showManufacturerOrder = additionalProperties.find((p) =>
    p.Имя.startsWith("ПоказыватьТорговым"),
  );
  if (showManufacturerOrder)
    initialSettings.guidsForSync.showManufacturerOrder =
      showManufacturerOrder.Ref_Key;

  const showOnSite = additionalProperties.find((p) =>
    p.Имя.startsWith("ПоказыватьТоварНаСайте"),
  );
  if (showOnSite)
    initialSettings.guidsForSync.nomenclature.showOnSite = showOnSite.Ref_Key;

  const minimumNonDivisibleWeight = additionalProperties.find((p) =>
    p.Имя.startsWith("ОбязательнаяКратность"),
  );
  if (minimumNonDivisibleWeight)
    initialSettings.guidsForSync.nomenclature.minimumNonDivisibleWeight =
      minimumNonDivisibleWeight.Ref_Key;

  const kilogram = mainUnits.find((u) => u.Description === "кг");
  if (kilogram) initialSettings.guidsForSync.units.kilogram = kilogram.Ref_Key;

  const piece = mainUnits.find((u) => u.Description === "шт");
  if (piece) initialSettings.guidsForSync.units.piece = piece.Ref_Key;

  const showUserOnSite = additionalProperties.find((p) =>
    p.Имя.startsWith("ПоказыватьНаСайтеСверкиЗаказов"),
  );
  if (showUserOnSite)
    initialSettings.guidsForSync.user.showOnSite = showUserOnSite.Ref_Key;

  const sitePassword = additionalProperties.find((p) =>
    p.Имя.startsWith("ПарольДляВходаНаСайт"),
  );
  if (sitePassword)
    initialSettings.guidsForSync.user.sitePassword = sitePassword.Ref_Key;

  const siteRole = additionalProperties.find((p) =>
    p.Имя.startsWith("РольНаСайте"),
  );
  if (siteRole) initialSettings.guidsForSync.user.siteRole = siteRole.Ref_Key;

  const siteRoleAdminValue = propertyValues.find((p) =>
    p.Description.startsWith("Администратор"),
  );

  if (siteRoleAdminValue)
    initialSettings.guidsForSync.user.siteRoleAdminValue =
      siteRoleAdminValue.Ref_Key;

  const siteRoleEmployeeValue = propertyValues.find((p) =>
    p.Description.startsWith("Пользователь"),
  );

  if (siteRoleEmployeeValue)
    initialSettings.guidsForSync.user.siteRoleEmployeeValue =
      siteRoleEmployeeValue.Ref_Key;

  const newSettings = await db
    .insert(siteSettings)
    .values({
      settings: initialSettings,
    })
    .returning();

  revalidateTag("site-settings");

  return {
    status: "success",
    data: "Настройки успешно установлены",
  };
}
