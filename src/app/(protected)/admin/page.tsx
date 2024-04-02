import Link from "next/link";
import React from "react";

import { getActiveUser } from "@/actions/user/active-user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    <div>
      <h1 className="p-4 text-center text-2xl font-bold">Админка</h1>
      <nav>
        <ul className="flex flex-col items-center space-y-2 text-lg text-orange-500">
          <li>
            <Link href="/admin/sync">Синхронизация</Link>
          </li>
          <li>
            <Link href="/admin/prices">Цены из 1С</Link>
          </li>
          <li>
            <Link href="/admin/users">Пользователи</Link>
          </li>
          <li>
            <Link href="/admin/site-settings">Глобальные настройки сайта</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminPage;
