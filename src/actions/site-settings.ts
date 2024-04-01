"use server";

import bcrypt from "bcryptjs";
import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

import { auth } from "@/auth";
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

export async function getGuidsFrom1C(): Promise<IActionResponse<any>> {
  const role = await currentRole();

  if (role !== "admin") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }

  try {
    const warehouses = await From1C.getAllWarehouses();
    const priceTypes = await From1C.getAllPriceTypes();
    const additionalProperties = await From1C.getAllAdditionalProperties();
    const mainUnits = await From1C.getMainUnits();
    const propertyValues = await From1C.getAllPropertyValues();

    return {
      status: "success",
      data: {
        warehouses,
        priceTypes,
        additionalProperties,
        mainUnits,
        propertyValues,
      },
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
    // Create a default admin user
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const newUserRes = await db
      .insert(users)
      .values({
        phone: "+79999999999",
        name: "Первоначальный администратор",
        password: hashedPassword,
        role: "admin",
      })
      .returning();
    if (newUserRes.length === 0) {
      return {
        status: "error",
        error: "Ошибка при создании профиля",
      };
    }
    console.log(
      `Created a default admin user with password: ${randomPassword} and phone: +79999999999`,
    );
    return {
      status: "success",
      data: `Ваш профиль был создан, ${newUserRes[0].name}. Вы можете войти на сайт с помощью номера телефона +79999999999 и пароля. Ваш пароль: ${randomPassword}`,
    };
  }

  const authObj = await auth();

  if (authObj?.user?.role !== "admin") {
    return {
      status: "error",
      error:
        "Вы не администратор. Войдите под администратором для настройки сайта",
    };
  }

  return {
    status: "success",
    data: "Первоначальная настройка сайта",
  };
}
