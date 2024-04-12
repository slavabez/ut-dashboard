"use server";

import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/drizzle/db";
import {
  PriceInsert,
  PriceSelect,
  SettingsSelect,
  prices,
  siteSettings,
  syncLogs,
} from "@/drizzle/schema";
import { currentRole, currentUser } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import {
  getAllAdditionalProperties,
  getAllPropertyValues,
  getMainUnits,
} from "@/lib/odata/metadata";
import { getAllWarehouses } from "@/lib/odata/stock";
import { KeyMemoryInfo, clearAllRedisCache, scanKeys } from "@/lib/redis";
import {
  ISiteSettingsStrict,
  setNewSettings,
  verifySettings,
} from "@/lib/site-settings";

export async function getSiteSettingsAction(): Promise<
  IActionResponse<SettingsSelect>
> {
  const role = await currentRole();

  try {
    const settings = await db
      .select()
      .from(siteSettings)
      .orderBy(desc(siteSettings.createdAt))
      .limit(1);

    if (settings.length < 1) {
      return {
        status: "error",
        error: "Сайт еще не был настроен",
      };
    }

    if (role !== "admin") {
      return {
        status: "error",
        error: "У вас недостаточно прав для этого действия",
      };
    }

    return {
      status: "success",
      data: settings[0],
    };
  } catch (e) {
    console.error("getSiteSettings server action error", e);
    return {
      status: "error",
      error: "Ошибка при получении настроек сайта",
    };
  }
}

export async function setSiteSettingsAction(
  newSettings: ISiteSettingsStrict,
): Promise<IActionResponse<SettingsSelect>> {
  try {
    const verified = verifySettings(newSettings);
    const inserted = await setNewSettings(verified);
    return {
      status: "success",
      data: inserted,
    };
  } catch (e) {
    return {
      status: "error",
      // @ts-ignore
      error: typeof e === "string" ? e : e.message,
    };
  }
}

async function getGuidsRaw() {
  const warehouses = await getAllWarehouses();
  const additionalProperties = await getAllAdditionalProperties();
  const mainUnits = await getMainUnits();
  const propertyValues = await getAllPropertyValues();

  return {
    warehouses,
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
  const role = await currentRole();

  if (role !== "admin") {
    return {
      status: "error",
      error: "У нас недостаточно прав для данного действия",
    };
  }

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

/**
 * Attempts to automatically fetch and assign the guids for the 1C settings.
 */
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

  const initialSettings: ISiteSettingsStrict = {
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
      orders: {
        latitude: "",
        longitude: "",
        timeStarted: "",
        timeStopped: "",
      },
    },
  };

  const { additionalProperties, mainUnits, propertyValues, warehouses } =
    await getGuidsRaw();

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

  const latitude = additionalProperties.find(
    (p) => p.Description === "АгентПлюсДокументШирота",
  );
  if (latitude) initialSettings.guidsForSync.orders.latitude = latitude.Ref_Key;

  const longitude = additionalProperties.find(
    (p) => p.Description === "АгентПлюсДокументДолгота",
  );
  if (longitude)
    initialSettings.guidsForSync.orders.longitude = longitude.Ref_Key;

  const timeStarted = additionalProperties.find(
    (p) => p.Description === "АгентПлюсДокументВремяНачала",
  );
  if (timeStarted)
    initialSettings.guidsForSync.orders.timeStarted = timeStarted.Ref_Key;

  const timeStopped = additionalProperties.find(
    (p) => p.Description === "АгентПлюсДокументВремяОкончания",
  );
  if (timeStopped)
    initialSettings.guidsForSync.orders.timeStopped = timeStopped.Ref_Key;

  await setNewSettings(initialSettings);

  return {
    status: "success",
    data: "Настройки успешно установлены",
  };
}

export async function clearRedisCache(): Promise<IActionResponse<string>> {
  try {
    await clearAllRedisCache();
    return {
      status: "success",
      data: "Redis кэш очищен",
    };
  } catch (e) {
    console.error("clearRedisCache() error:", e);
    return {
      status: "error",
      error: "Ошибка при очистке кэша Redis",
    };
  }
}

export async function getRedisCacheInfo(): Promise<
  IActionResponse<KeyMemoryInfo[]>
> {
  try {
    const redisKeys = await scanKeys("*");

    return {
      status: "success",
      data: redisKeys,
    };
  } catch (e) {
    console.error("getRedisCacheInfo() error:", e);
    return {
      status: "error",
      error: "Ошибка при чтении ключей в Redis",
    };
  }
}
