import React from "react";

import {
  getGuidsFrom1C,
  getSiteSettingsAction,
  initialiseSite,
} from "@/actions/site-settings";
import SiteSettingsForm from "@/app/(protected)/admin/site-settings/_components/site-settings-form";
import PageWrapper from "@/components/layout-components";
import LinkButton from "@/components/link-button";
import { H1, P } from "@/components/typography";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ISiteSettingsStrict } from "@/lib/site-settings";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SiteSettingsPage = async () => {
  const latestSettings = await getSiteSettingsAction();

  if (latestSettings.status === "error") {
    if (latestSettings.error === "Сайт еще не был настроен") {
      return (
        <PageWrapper>
          <Alert variant="primary">Сайт еще не был настроен</Alert>
          <form action={initialiseSite}>
            <Button type="submit">Инициализировать сайт</Button>
          </form>
        </PageWrapper>
      );
    } else {
      return (
        <PageWrapper>
          <Alert variant="destructive">{latestSettings.error}</Alert>
        </PageWrapper>
      );
    }
  }

  const guidsFrom1C = await getGuidsFrom1C();
  if (guidsFrom1C.status === "error") {
    return <div>{guidsFrom1C.error}</div>;
  }

  return (
    <PageWrapper className="flex flex-col gap-2 p-4">
      <H1>Глобальные настройки сайта</H1>

      <P>
        Последнее обновление:{" "}
        {latestSettings.status === "success"
          ? timeAgo(latestSettings.data?.createdAt)
          : "Никогда"}
      </P>

      <LinkButton href="/admin/site-settings/redis">
        Настройки кэша Redis
      </LinkButton>

      <SiteSettingsForm
        initialData={
          latestSettings.status === "success"
            ? (latestSettings.data?.settings as ISiteSettingsStrict)
            : undefined
        }
        guidsFrom1C={guidsFrom1C.data}
      />
    </PageWrapper>
  );
};

export default SiteSettingsPage;
