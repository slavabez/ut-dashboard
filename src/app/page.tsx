import { BadgeDollarSign, CircleUser, Lock, LogIn } from "lucide-react";
import React from "react";

import ButtonContainer from "@/app/_components/button-container";
import LoggedInStatus from "@/app/_components/logged-in-status";
import { OneCIcon } from "@/components/custom-icons";
import { PageWrapper } from "@/components/layout-components";
import LinkButton from "@/components/link-button";
import { H1, H2, P, UL } from "@/components/typography";

export default function Home() {
  return (
    <PageWrapper>
      <H1>Панель управления</H1>
      <P>
        Данное приложение - портал для сотрудников компании Сказка, ИП Безгачева
        О.А., г. Кокшетау, Казахстан
      </P>
      <LoggedInStatus />
      <H2>Рабочий функционал</H2>
      <UL>
        <li>Сверка заказов</li>
        <li>Отчёты по продажам</li>
        <li>Задолженность клиентов</li>
      </UL>
      <H2>Функционал в разработке</H2>
      <UL>
        <li>Прайс листы с разными ценами</li>
        <li>Контроль торговых агентов</li>
      </UL>
      <nav>
        <ButtonContainer>
          <LinkButton href="/auth/register">
            <Lock className="mr-2 h-8 w-8" /> Регистрация
          </LinkButton>
          <LinkButton href="/auth/login">
            <LogIn className="mr-2 h-8 w-8" />
            Вход
          </LinkButton>
          <LinkButton href="/orders">
            <OneCIcon className="mr-2 h-8 w-8" /> Заказы в 1С
          </LinkButton>
          <LinkButton href="/reports">
            <BadgeDollarSign className="mr-2 h-8 w-8" />
            Отчёты
          </LinkButton>
          <LinkButton href="/admin">
            <CircleUser className="mr-2 h-8 w-8" />
            Админка
          </LinkButton>
        </ButtonContainer>
      </nav>
    </PageWrapper>
  );
}
