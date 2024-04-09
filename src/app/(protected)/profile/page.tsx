import { BadgeDollarSign, CircleUserRound, LogOut } from "lucide-react";
import React from "react";

import { logout } from "@/actions/auth/logout";
import { getActiveUser } from "@/actions/user/active-user";
import { OneCIcon } from "@/components/custom-icons";
import PageWrapper from "@/components/layout-components";
import LinkButton from "@/components/link-button";
import { H1 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { IUserMeta } from "@/lib/common-types";
import { translateRole } from "@/lib/utils";

const ProfilePage = async () => {
  const userResponse = await getActiveUser();
  let user1CMeta: IUserMeta | undefined;

  if (userResponse.status === "error") {
    return (
      <PageWrapper>
        <H1>
          <CircleUserRound />
          Профиль
        </H1>
        <div className="text-center">Вы не вошли</div>
      </PageWrapper>
    );
  }

  user1CMeta = userResponse.data.meta as IUserMeta | undefined;

  return (
    <PageWrapper>
      <H1>
        <CircleUserRound className="h-10 w-10" />
        Профиль
      </H1>

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
      <div className="flex flex-col gap-2">
        <LinkButton href="/orders">
          <OneCIcon className="mr-2 h-8 w-8" /> Сверка заказов с 1С
        </LinkButton>
        <LinkButton href="/reports">
          <BadgeDollarSign className="mr-2 h-8 w-8" />
          Отчёты по продажам
        </LinkButton>
        <form action={logout}>
          <Button variant="destructive" className="w-full" type="submit">
            <LogOut className="mr-2 h-8 w-8" />
            Выйти
          </Button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default ProfilePage;
