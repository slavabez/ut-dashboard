import { CalendarDays } from "lucide-react";
import React from "react";

import { getOrdersByDate } from "@/actions/orders";
import OrderDatePicker from "@/app/(protected)/orders/_components/order-date-picker";
import OrderList from "@/app/(protected)/orders/_components/order-list";
import { formatPrice, getDateFor1C } from "@/lib/utils";

const OrdersByOrderDate = async ({
  searchParams,
}: {
  searchParams: {
    date?: string;
  };
}) => {
  const date = searchParams?.date ?? getDateFor1C();
  const orders = await getOrdersByDate(date);

  if (orders.status === "error") {
    return (
      <div className="p-4">
        <h1 className="my-2 text-center text-xl font-semibold">
          <CalendarDays className="mr-2" /> Заказы по дате создания
        </h1>
        <OrderDatePicker
          searchParamName="date"
          title="Дата заказов"
          description="Здесь будут показаны заказы, созданные в выбранный вами день."
        />
        <div className="text-center text-red-500">{orders.error}</div>
      </div>
    );
  }

  const totalSum = orders.data.reduce((acc, order) => acc + order.sum, 0);
  const totalCount = orders.data.length;

  return (
    <div className="p-4">
      <h1 className="my-2 flex text-center text-xl font-semibold">
        <CalendarDays className="mr-2" /> Заказы по дате создания
      </h1>
      <OrderDatePicker
        searchParamName="date"
        title="Дата заказов"
        description="Здесь будут показаны заказы, созданные в выбранный вами день."
      />
      <div className="mb-4 text-center text-muted-foreground">
        Заказов: {totalCount} на сумму {formatPrice(totalSum)}
      </div>
      <OrderList orders={orders.data} />
    </div>
  );
};

export default OrdersByOrderDate;
