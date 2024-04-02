"use client";

import React, { useState, useTransition } from "react";

import { fetchMetaFrom1C } from "@/actions/user/all-users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IUserMeta } from "@/lib/common-types";

interface UserUpdateFormProps {
  initialUserMeta: IUserMeta;
}

const UserMetaUpdateForm = ({ initialUserMeta }: UserUpdateFormProps) => {
  const [userMeta, setUserMeta] = useState<IUserMeta | null>(
    initialUserMeta as IUserMeta,
  );
  const [isMetaFetchPending, startMetaFetch] = useTransition();

  function fetchUserMeta() {
    startMetaFetch(() => {
      if (userMeta?.id) {
        fetchMetaFrom1C(userMeta.id).then((data) => {
          if (data.status === "success") {
            setUserMeta(data.data.meta as IUserMeta);
          }
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Данные из 1С</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <dl>
            <dt className="text-gray-500">Пользователь</dt>
            <dd>{userMeta?.name}</dd>
          </dl>
          <dl>
            <dt className="text-gray-500">Имя физ. лица</dt>
            <dd>{userMeta?.realName}</dd>
          </dl>
          <dl>
            <dt className="text-gray-500">Роль</dt>
            <dd>{userMeta?.siteRole}</dd>
          </dl>
          <dl>
            <dt className="text-gray-500">Телефон</dt>
            <dd>{userMeta?.phone}</dd>
          </dl>
          <dl>
            <dt className="text-gray-500">ИИН</dt>
            <dd>{userMeta?.iin}</dd>
          </dl>
          <dl>
            <dt className="text-gray-500">Email</dt>
            <dd>{userMeta?.email}</dd>
          </dl>
          <dl>
            <dt className="text-gray-500">Показывать на сайте?</dt>
            <dd>{userMeta?.showOnSite ? "Да" : "Нет"}</dd>
          </dl>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={fetchUserMeta} disabled={isMetaFetchPending}>
          Обновить данные из 1С {isMetaFetchPending ? "..." : ""}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserMetaUpdateForm;
