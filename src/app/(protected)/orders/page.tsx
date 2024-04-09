import { CalendarDays, Truck } from "lucide-react";
import React from "react";

import PageWrapper from "@/components/layout-components";
import LinkButton from "@/components/link-button";
import { H1, Muted, P } from "@/components/typography";

const OrdersPage = () => {
  return (
    <PageWrapper>
      <H1>Сверка заказов</H1>
      <P>В этом разделе вы можете сверить заказы с главной базой.</P>
      <Muted>
        Информация является актуальной в реальном времени в момент загрузки.
      </Muted>
      <nav className="flex flex-col gap-4">
        <LinkButton href="/orders/by-date">
          <CalendarDays className="mr-2" /> По дате создания заказа
        </LinkButton>

        <LinkButton href="/orders/by-delivery-date">
          <Truck className="mr-2" /> По дате доставки заказа
        </LinkButton>
      </nav>
    </PageWrapper>
  );
};

export default OrdersPage;
