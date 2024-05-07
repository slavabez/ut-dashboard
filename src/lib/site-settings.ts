import { desc } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { siteSettings } from "@/drizzle/schema";
import { redis } from "@/lib/redis";

export interface ISiteSettingsStrict {
  guidsForSync: {
    warehouse: string;
    showManufacturerOrder: string;
    user: {
      showOnSite: string;
      sitePassword: string;
      siteRole: string;
      siteRoleAdminValue: string;
      siteRoleEmployeeValue: string;
      siteRoleManagerValue: string;
    };
    nomenclature: {
      minimumNonDivisibleWeight: string;
      hideOnSite: string;
    };
    units: {
      kilogram: string;
      piece: string;
    };
    orders: {
      longitude: string;
      latitude: string;
      timeStarted: string;
      timeStopped: string;
    };
  };
}

export async function getLatestSiteSettings(): Promise<ISiteSettingsStrict> {
  const cachedSettings = await redis.get("site-settings");
  if (cachedSettings) {
    return JSON.parse(cachedSettings);
  }

  const settings = await db
    .select()
    .from(siteSettings)
    .orderBy(desc(siteSettings.createdAt))
    .limit(1);

  if (settings.length < 1) {
    throw new Error("No global site settings found");
  }

  const verified = verifySettings(settings[0].settings);

  await redis.set("site-settings", JSON.stringify(verified));
  return verified;
}

export function verifySettings(settings: any) {
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
  if (!guids.user.siteRoleManagerValue) {
    throw new Error("No user.siteRoleManagerValue guid found in the settings");
  }
  if (!guids.nomenclature) {
    throw new Error("No nomenclature guids found in the settings");
  }
  if (!guids.nomenclature.minimumNonDivisibleWeight) {
    throw new Error(
      "No nomenclature.minimumNonDivisibleWeight guid found in the settings",
    );
  }
  if (!guids.nomenclature.hideOnSite) {
    throw new Error("No nomenclature.hideOnSite guid found in the settings");
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
  if (!guids.orders)
    throw new Error("No orders guid object found in the settings");
  if (!guids.orders?.latitude)
    throw new Error("No latitude guid found in the settings");
  if (!guids.orders?.longitude)
    throw new Error("No longitude guid found in the settings");
  if (!guids.orders?.timeStarted)
    throw new Error("No time started guid found in the settings");
  if (!guids.orders?.timeStopped)
    throw new Error("No time stopped guid found in the settings");

  return settings;
}

export async function setNewSettings(newSettings: ISiteSettingsStrict) {
  const verified = verifySettings(newSettings);
  const inserted = await db
    .insert(siteSettings)
    .values({
      settings: verified,
    })
    .returning();
  await redis.del("site-settings");
  return inserted[0];
}
