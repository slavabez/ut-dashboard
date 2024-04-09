import { BadgeDollarSign, Package } from "lucide-react";
import React from "react";

import PageWrapper from "@/components/layout-components";
import LinkButton from "@/components/link-button";
import { H1, P } from "@/components/typography";

const ReportsPage = () => {
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
          <BadgeDollarSign className="mr-2" /> Продажи по клиентам и товарам
          <Package className="ml-2" />
        </LinkButton>
      </nav>
    </PageWrapper>
  );
};

export default ReportsPage;
