import { Package } from "lucide-react";
import React from "react";

import {
  IFormattedPartnerReportItem,
  getSalesByClients,
} from "@/actions/reports";
import { ReportsDateRangePicker } from "@/app/(protected)/reports/_components/reports-date-picker";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";

const SalesByClients = async ({
  searchParams,
}: {
  searchParams: {
    range?: string;
  };
}) => {
  const range = searchParams?.range;
  const parts = range?.split("..") ?? [];
  const from = parts.length > 0 ? parts[0] : null;
  const to = parts.length > 1 ? parts[1] : null;

  let reportData: IFormattedPartnerReportItem[] = [];
  if (to && from) {
    const reportResponse = await getSalesByClients({
      startDate: from,
      endDate: to,
    });
    if (reportResponse.status === "success" && reportResponse.data) {
      reportData = reportResponse.data;
    }
  }

  const totals = reportData.reduce(
    (acc, item) => {
      return {
        sum: acc.sum + item.sum,
        discount: acc.discount + item.discount,
        quantity: acc.quantity + item.quantity,
      };
    },
    {
      sum: 0,
      discount: 0,
      quantity: 0,
    },
  );

  return (
    <div className="p-4 flex flex-col gap-2 justify-center">
      <h1 className="text-xl font-semibold my-2 flex justify-center">
        <Package className="mr-2" /> Продажи по товарам
      </h1>
      <ReportsDateRangePicker searchParamName="range" title="Период" />

      <Separator />
      <p>
        Общие продажи:{" "}
        <span className="font-bold">{formatPrice(totals.sum)}</span>
      </p>
      <p>Общая скидка: {formatPrice(totals.discount)}</p>
      <Separator />

      <Table>
        <TableHeader>
          <TableRow className="bg-orange-500 text-white font-bold">
            <TableCell>Клиент</TableCell>
            <TableCell>Сумма</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.map((item, index) => {
            return (
              <TableRow
                key={item.partner}
                className={index % 2 === 0 ? "bg-orange-50" : ""}
              >
                <TableCell>{item.partner}</TableCell>
                <TableCell>
                  <span className="font-bold">{formatPrice(item.sum)}</span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalesByClients;
