import { BadgeDollarSign, CircleUser, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import React from "react";

import { OneCIcon } from "@/components/custom-icons";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-center text-2xl font-bold">Панель управления</h1>
      <p>
        Данное приложение - портал для сотрудников компании Сказка, ИП Безгачева
        О.А., г. Кокшетау, Казахстан
      </p>
      <h2 className="text-center text-xl font-medium">Рабочий функционал</h2>
      <ul className="ml-8 list-disc">
        <li>Сверка заказов</li>
        <li>Отчёты по продажам</li>
      </ul>
      <h2 className="text-center text-xl font-medium text-muted-foreground">
        Функционал в разработке
      </h2>
      <ul className="ml-8 list-disc text-muted-foreground">
        <li>Прайс листы с разными ценами</li>
        <li>Список и сверка долгов</li>
      </ul>
      <nav>
        <ul className="flex flex-col items-stretch space-y-2 text-lg text-orange-500">
          <Button asChild>
            <Link href="/auth/register">
              <Lock className="mr-2 h-8 w-8" /> Регистрация
            </Link>
          </Button>
          <Button asChild>
            <Link href="/auth/login">
              <LogIn className="mr-2 h-8 w-8" />
              Вход
            </Link>
          </Button>

          <Button asChild>
            <Link href="/orders">
              <OneCIcon className="mr-2 h-8 w-8" /> Сверка заказов с 1С
            </Link>
          </Button>
          <Button asChild>
            <Link href="/reports">
              <BadgeDollarSign className="mr-2 h-8 w-8" />
              Отчёты по продажам
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin">
              <CircleUser className="mr-2 h-8 w-8" />
              Админка
            </Link>
          </Button>
        </ul>
      </nav>
    </div>
  );
}
