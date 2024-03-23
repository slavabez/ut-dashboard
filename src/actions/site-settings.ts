"use server";

import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/drizzle/db";
import {
  PriceInsert,
  PriceSelect,
  SettingsSelect,
  prices,
  siteSettings,
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

export async function getLatestSiteSettings(): Promise<
  IActionResponse<SettingsSelect>
> {
  const latestSettings = await db
    .select()
    .from(siteSettings)
    .orderBy(desc(siteSettings.createdAt))
    .limit(1);

  return {
    status: "success",
    data: latestSettings[0],
  };
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

  return {
    status: "success",
    data: newSettings[0],
  };
}

export async function getGuidsFrom1C(): Promise<IActionResponse<any>> {
  // TODO: add a role check?
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

export async function getPricesInDb(): Promise<IActionResponse<PriceSelect[]>> {
  const allPricesInDb = await db.query.prices.findMany();

  return {
    status: "success",
    data: allPricesInDb,
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
