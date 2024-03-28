import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

const OrdersPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-center mt-2 mb-8">
        🗂 Сверка заказов
      </h1>
      <nav className="flex flex-col gap-4">
        <Button asChild variant="link">
          <Link className="" href="/orders/by-date">
            🗓 По дате создания заказа
          </Link>
        </Button>
        <Button asChild variant="link">
          <Link className="" href="/orders/by-delivery-date">
            🚛 По дате доставки заказа
          </Link>
        </Button>
      </nav>
    </div>
  );
};

export default OrdersPage;
