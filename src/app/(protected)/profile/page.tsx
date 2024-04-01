import { BadgeDollarSign, CircleUserRound, LogOut } from "lucide-react";
import Link from "next/link";
import React from "react";

import { logout } from "@/actions/auth/logout";
import { getActiveUser } from "@/actions/user/active-user";
import { OneCIcon } from "@/components/custom-icons";
import { Button } from "@/components/ui/button";
import { IUserMeta } from "@/lib/common-types";
import { translateRole } from "@/lib/utils";

const ProfilePage = async () => {
  const userResponse = await getActiveUser();
  let user1CMeta: IUserMeta | undefined;

  if (userResponse.status === "error") {
    return (
      <div className="p-4">
        <h1 className="mb-8 mt-2 flex items-center justify-center gap-2 text-2xl font-semibold">
          <CircleUserRound />
          Профиль
        </h1>
        <div className="text-center">Вы не вошли</div>
      </div>
    );
  }

  user1CMeta = userResponse.data.meta as IUserMeta | undefined;

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="mb-8 mt-2 flex items-center justify-center gap-2 text-2xl font-semibold">
        <CircleUserRound />
        Профиль
      </h1>

      <div className="flex flex-col gap-4">
        <dl>
          <dt className="text-gray-500">Пользователь</dt>
          <dd>{userResponse.data?.name}</dd>
        </dl>
        <dl>
          <dt className="text-gray-500">Имя</dt>
          <dd>{user1CMeta?.realName}</dd>
        </dl>
        <dl>
          <dt className="text-gray-500">Роль</dt>
          <dd>{translateRole(userResponse.data.role)}</dd>
        </dl>
        <dl>
          <dt className="text-gray-500">Телефон</dt>
          <dd>{userResponse.data.phone}</dd>
        </dl>
      </div>
      <div className="flex flex-col">
        <ul className="flex flex-col gap-4">
          <li>
            <Button asChild className="w-full">
              <Link href="/orders">
                <OneCIcon className="mr-2 h-8 w-8" /> Сверка заказов с 1С
              </Link>
            </Button>
          </li>
          <li>
            <Button asChild className="w-full">
              <Link href="/reports">
                <BadgeDollarSign className="mr-2 h-8 w-8" />
                Отчёты по продажам
              </Link>
            </Button>
          </li>
          <li>
            <form action={logout}>
              <Button variant="destructive" className="w-full" type="submit">
                <LogOut className="mr-2 h-8 w-8" />
                Выйти
              </Button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePage;
