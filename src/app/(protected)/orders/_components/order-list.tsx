import React from "react";

import OrderListItem from "@/app/(protected)/orders/_components/order-list-item";
import { IOrder } from "@/lib/1c-adapter";

const OrderList = ({ orders }: { orders: IOrder[] }) => {
  return (
    <div className="flex flex-col gap-2">
      {orders.map((order, index) => (
        <OrderListItem key={order.id} item={order} index={index + 1} />
      ))}
    </div>
  );
};

export default OrderList;
