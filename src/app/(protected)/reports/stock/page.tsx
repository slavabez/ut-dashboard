import { Warehouse } from "lucide-react";
import Link from "next/link";
import React from "react";

import { getLatestStockSyncTime, getStockWithFilters } from "@/actions/stock";
import PageWrapper from "@/components/layout-components";
import { H1, P } from "@/components/typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";

const StockReport = async ({
  searchParams,
}: {
  searchParams: {
    name?: string;
    manufacturerId?: string;
    inStockOnly?: string;
  };
}) => {
  const { name, manufacturerId, inStockOnly } = searchParams;
  const latestSyncTime = await getLatestStockSyncTime();
  const stockResponse = await getStockWithFilters({
    name,
    manufacturerId,
    inStockOnly,
  });

  if (stockResponse.status === "error") {
    return (
      <PageWrapper>
        <Alert variant="destructive">
          <AlertTitle>Ошибка получения данных</AlertTitle>
          <AlertDescription>{stockResponse.error}</AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }
  return (
    <PageWrapper>
      <H1>
        <Warehouse className="h-10 w-10" />
        Остатки товаров на складе
      </H1>
      <P>Остатки обновлены: {timeAgo(latestSyncTime)}</P>
      <ul>
        {stockResponse.data.map((ni) => (
          <Button variant="link" key={ni.id}>
            <Link href={`/nomenclature/${ni.id}`}>{ni.name}</Link>
          </Button>
        ))}
      </ul>
      <pre>{JSON.stringify(stockResponse, null, 2)}</pre>
    </PageWrapper>
  );
};

export default StockReport;
