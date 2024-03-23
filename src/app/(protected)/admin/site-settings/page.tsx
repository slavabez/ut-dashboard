import React from "react";

import {
  ISiteSettings,
  getGuidsFrom1C,
  getLatestSiteSettings,
} from "@/actions/site-settings";
import SiteSettingsForm from "@/app/(protected)/admin/site-settings/_components/site-settings-form";
import { formatRelativeDate } from "@/lib/utils";

const SiteSettingsPage = async () => {
  const latestSettings = await getLatestSiteSettings();
  const guidsFrom1C = await getGuidsFrom1C();

  if (latestSettings.status === "error") {
    return <div>{latestSettings.error}</div>;
  }
  if (guidsFrom1C.status === "error") {
    return <div>{guidsFrom1C.error}</div>;
  }

  return (
    <div>
      <h1 className="p-4 text-xl font-bold">Глобальные Настройки сайта</h1>
      <p className=" px-4 text-muted-foreground text-sm">
        Последнее обновление:{" "}
        {formatRelativeDate(latestSettings.data?.createdAt)}
      </p>
      <SiteSettingsForm
        initialData={latestSettings.data?.settings as ISiteSettings}
        guidsFrom1C={guidsFrom1C.data}
      />
    </div>
  );
};

export default SiteSettingsPage;
