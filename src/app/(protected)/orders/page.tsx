import { CalendarDays, Truck } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

const OrdersPage = () => {
  return (
    <div className="p-4">
      <h1 className="mb-8 mt-2 text-center text-2xl font-semibold">
        Сверка заказов
      </h1>
      <nav className="flex flex-col gap-4">
        <Button asChild>
          <Link className="" href="/orders/by-date">
            <CalendarDays className="mr-2" /> По дате создания заказа
          </Link>
        </Button>
        <Button asChild>
          <Link className="" href="/orders/by-delivery-date">
            <Truck className="mr-2" /> По дате доставки заказа
          </Link>
        </Button>
      </nav>
    </div>
  );
};

export default OrdersPage;