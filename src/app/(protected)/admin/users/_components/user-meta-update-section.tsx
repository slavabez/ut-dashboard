"use client";

import React, { useState, useTransition } from "react";

import { fetchMetaFrom1C } from "@/actions/user/all-users";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
    <Accordion type="single" collapsible>
      <AccordionItem value={"1"}>
        <AccordionTrigger>Данные из 1С</AccordionTrigger>
        <AccordionContent>
          <div className="gap-4 flex flex-col">
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
            <Button onClick={fetchUserMeta} disabled={isMetaFetchPending}>
              Обновить данные из 1С {isMetaFetchPending ? "..." : ""}
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default UserMetaUpdateForm;
