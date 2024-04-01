import { BadgeDollarSign, Package } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

const ReportsPage = () => {
  return (
    <div className="p-4">
      <h1 className="mb-8 mt-2 text-center text-2xl font-semibold">Отчёты</h1>
      <nav className="flex flex-col gap-4">
        <Button asChild>
          <Link className="" href="/reports/sales-by-goods">
            <Package className="mr-2" /> Продажи по товарам
          </Link>
        </Button>
        <Button asChild>
          <Link className="" href="/reports/sales-by-clients">
            <BadgeDollarSign className="mr-2" /> Продажи по клиентам
          </Link>
        </Button>
        <Button asChild>
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
