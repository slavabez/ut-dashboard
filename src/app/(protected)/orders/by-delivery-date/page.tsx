import { Truck } from "lucide-react";
import React from "react";

import { getOrdersByDeliveryDate } from "@/actions/orders";
import OrderDatePicker from "@/app/(protected)/orders/_components/order-date-picker";
import OrderList from "@/app/(protected)/orders/_components/order-list";
import { PageWrapper } from "@/components/layout-components";
import { H1, Large } from "@/components/typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatPrice, getDateFor1C } from "@/lib/utils";

export const dynamic = "force-dynamic";

const OrdersByDeliveryDate = async ({
  searchParams,
}: {
  searchParams: {
    date?: string;
  };
}) => {
  const date = searchParams?.date ?? getDateFor1C();
  const orders = await getOrdersByDeliveryDate(date);

  if (orders.status === "error") {
    return (
      <PageWrapper>
        <H1>
          <Truck className="h-10 w-10" /> Заказы по дате доставки
        </H1>
        <OrderDatePicker
          searchParamName="date"
          title="Дата заказов"
          description="Здесь будут показаны заказы, созданные в выбранный вами день."
        />
        <Alert variant="destructive">
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{orders.error}</AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  const totalSum = orders.data.reduce((acc, order) => acc + order.sum, 0);
  const totalCount = orders.data.length;

  return (
    <PageWrapper>
      <H1>
        <Truck className="h-10 w-10" /> Заказы по дате доставки
      </H1>
      <OrderDatePicker
        searchParamName="date"
        title="Дата доставки"
        description="Здесь будут показаны заказы, помеченные на доставку в выбранный вами день."
      />
      <Large>
        Заказов: {totalCount} на сумму {formatPrice(totalSum)}
      </Large>
      <OrderList orders={orders.data} />
    </PageWrapper>
  );
};

export default OrdersByDeliveryDate;
