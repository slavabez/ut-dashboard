import Link from "next/link";
import React from "react";

import { getActiveUser } from "@/actions/user/active-user";
import LinkOpener from "@/app/(protected)/_components/link-opener";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const AdminPage = async () => {
  const userResponse = await getActiveUser();

  if (userResponse.status === "error") {
    return (
      <div className="p-4">
        <Alert>
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{userResponse.error}</AlertDescription>
        </Alert>
      </div>
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
    <div className="flex flex-col items-stretch gap-2 p-4">
      <h1 className="mb-2 text-center text-2xl font-bold">Админка</h1>
      <Button asChild>
        <Link href="/admin/sync">Синхронизация</Link>
      </Button>
      <Button asChild>
        <Link href="/admin/prices">Цены из 1С</Link>
      </Button>
      <Button asChild>
        <Link href="/admin/users">Пользователи</Link>
      </Button>
      <Button asChild>
        <Link href="/admin/nomenclature">Номенклатура</Link>
      </Button>
      <Button asChild>
        <Link href="/admin/site-settings">Глобальные настройки сайта</Link>
      </Button>
      <LinkOpener />
    </div>
  );
};

export default AdminPage;
