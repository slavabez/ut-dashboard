import { BadgeDollarSign, CalendarDays, Package, Truck } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

const ReportsPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-center mt-2 mb-8">Отчёты</h1>
      <nav className="flex flex-col gap-4">
        <Button asChild variant="link">
          <Link className="" href="/reports/sales-by-goods">
            <Package className="mr-2" /> Продажи по товарам
          </Link>
        </Button>
        <Button asChild variant="link">
          <Link className="" href="/reports/sales-by-clients">
            <BadgeDollarSign className="mr-2" /> Продажи по клиентам
          </Link>
        </Button>
        <Button asChild variant="link">
          <Link className="" href="/reports/sales-by-clients-and-goods">
            <BadgeDollarSign className="mr-2" /> Продажи по клиентам и товарам
            <Package className="ml-2" />
          </Link>
        </Button>
      </nav>
    </div>
  );
};

export default ReportsPage;
