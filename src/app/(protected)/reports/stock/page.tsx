import { Warehouse } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { getManufacturersForSelect } from "@/actions/nomenclature/manufacturers";
import { getLatestStockSyncTime, getStockWithFilters } from "@/actions/stock";
import ManufacturerSelect from "@/app/(protected)/reports/stock/_components/manufacturer-select";
import NameSearchInput from "@/app/(protected)/reports/stock/_components/name-search-input";
import PageWrapper from "@/components/layout-components";
import { H1, Muted, P } from "@/components/typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const StockReport = async ({
  searchParams,
}: {
  searchParams: {
    name?: string;
    manufacturerId?: string;
  };
}) => {
  const { name, manufacturerId } = searchParams;
  const latestSyncTime = await getLatestStockSyncTime();
  const stockResponse = await getStockWithFilters({
    name,
    manufacturerId,
  });
  const allManufacturers = await getManufacturersForSelect();

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
      <ManufacturerSelect manufacturers={allManufacturers} />
      <NameSearchInput />
      <Muted>
        Товаров в наличии по выбранным критериям: {stockResponse.data.length}{" "}
        <Link className="text-orange-400" href="/reports/stock">
          Сбросить фильтры
        </Link>
      </Muted>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell colSpan={2}>Товар</TableCell>
            <TableCell>Остаток</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stockResponse.data.map((item, index) => {
            return (
              <TableRow key={item.id}>
                <TableCell className="h-[100px] w-[100px] p-0">
                  <Image
                    src={item.coverImage ?? "https://placehold.co/100"}
                    alt={item.name}
                    width={100}
                    height={100}
                  />
                </TableCell>
                <TableCell className="p-2">{item.name}</TableCell>
                <TableCell className="p-2">
                  <span className="font-bold">{item.stock}</span>{" "}
                  {item.baseUnitName}
                  <Link
                    className="block rounded-sm bg-orange-500 p-1 text-center text-white"
                    href={`/nomenclature/${item.id}`}
                  >
                    Детали
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </PageWrapper>
  );
};

export default StockReport;
