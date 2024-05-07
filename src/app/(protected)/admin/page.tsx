import React from "react";

import { getActiveUser } from "@/actions/user/active-user";
import LinkOpener from "@/app/(protected)/_components/link-opener";
import { PageWrapper } from "@/components/layout-components";
import LinkButton from "@/components/link-button";
import { H1 } from "@/components/typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

const AdminPage = async () => {
  const userResponse = await getActiveUser();

  if (userResponse.status === "error") {
    return (
      <PageWrapper>
        <Alert>
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{userResponse.error}</AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }
  if (userResponse.data.role !== "admin") {
    return (
      <div className="p-4">
        <Alert>
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>У вас нет доступа к этой странице</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <PageWrapper>
      <H1>Админка</H1>
      <div className="flex flex-col gap-2">
        <LinkButton href="/admin/sync">Синхронизация</LinkButton>
        <LinkButton href="/admin/prices">Цены из 1С</LinkButton>
        <LinkButton href="/admin/users">Пользователи</LinkButton>
        <LinkButton href="/admin/nomenclature">Номенклатура</LinkButton>
        <LinkButton href="/admin/site-settings">
          Глобальные настройки сайта
        </LinkButton>
      </div>

      <LinkOpener />
    </PageWrapper>
  );
};

export default AdminPage;
