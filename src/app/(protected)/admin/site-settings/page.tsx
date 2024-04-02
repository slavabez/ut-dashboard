import React from "react";

import {
  ISiteSettings,
  checkInit,
  getGuidsFrom1C,
  getLatestSiteSettings,
  initialiseSite,
  invalidateSiteSettingsCache,
} from "@/actions/site-settings";
import SiteSettingsForm from "@/app/(protected)/admin/site-settings/_components/site-settings-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";

const SiteSettingsPage = async () => {
  const latestSettings = await getLatestSiteSettings();

  if (latestSettings.status === "error") {
    if (latestSettings.error === "No settings found") {
      const initialCheck = await checkInit();
      if (initialCheck.status === "success") {
        return (
          <div className="flex flex-col gap-4 p-4">
            <Alert variant="primary">{initialCheck.data}</Alert>
            <form action={initialiseSite}>
              <Button type="submit">Инициализировать сайт</Button>
            </form>
          </div>
        );
      }
    } else {
      return <Alert variant="destructive">{latestSettings.error}</Alert>;
    }
  }

  const guidsFrom1C = await getGuidsFrom1C();
  if (guidsFrom1C.status === "error") {
    return <div>{guidsFrom1C.error}</div>;
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <h1 className="text-xl font-bold">Глобальные настройки сайта</h1>
      <form action={invalidateSiteSettingsCache}>
        <Button type="submit">Очистить кэш настроек</Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Последнее обновление:{" "}
        {latestSettings.status === "success"
          ? timeAgo(latestSettings.data?.createdAt)
          : "Никогда"}
      </p>
      <SiteSettingsForm
        initialData={
          latestSettings.status === "success"
            ? (latestSettings.data?.settings as ISiteSettings)
            : undefined
        }
        guidsFrom1C={guidsFrom1C.data}
      />
    </div>
  );
};

export default SiteSettingsPage;
