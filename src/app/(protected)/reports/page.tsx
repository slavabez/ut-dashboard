import {
  BadgeDollarSign,
  BarChartHorizontal,
  HandCoins,
  Package,
  Warehouse,
} from "lucide-react";
import React from "react";

import { PageWrapper } from "@/components/layout-components";
import LinkButton from "@/components/link-button";
import { H1, P } from "@/components/typography";

export const dynamic = "force-dynamic";

const ReportPage = () => {
  return (
    <PageWrapper>
      <H1>Отчёты</H1>
      <P>
        В данном разделе вам доступны отчеты о продажах в разных разрезах: по
        товарам (по производителям), по клиентам, или смешанный
      </P>
      <nav className="flex flex-col gap-4">
        <LinkButton href="/reports/sales-by-goods">
          <Package className="mr-2" /> Продажи по товарам
        </LinkButton>
        <LinkButton href="/reports/sales-by-clients">
          <BadgeDollarSign className="mr-2" /> Продажи по клиентам
        </LinkButton>
        <LinkButton href="/reports/sales-by-clients-and-goods">
          <BarChartHorizontal className="mr-2" /> Продажи по клиентам и товарам
        </LinkButton>
        <LinkButton href="/reports/debt">
          <HandCoins className="mr-2" /> Задолженность клиентов
        </LinkButton>
        <LinkButton href="/reports/stock">
          <Warehouse className="mr-2" /> Остатки товаров на складе
        </LinkButton>
      </nav>
    </PageWrapper>
  );
};

export default ReportPage;
