import { Package } from "lucide-react";
import React from "react";

import { getSalesByGoods } from "@/actions/reports";
import PieChart from "@/app/(protected)/reports/_components/pie-chart";
import ReportInnerTable from "@/app/(protected)/reports/_components/report-inner-table";
import { ReportsDateRangePicker } from "@/app/(protected)/reports/_components/reports-date-picker";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

const SalesByGoodsPage = async ({
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

  let reportData: any[] = [];
  if (to && from) {
    const reportResponse = await getSalesByGoods({
      startDate: from,
      endDate: to,
    });
    if (reportResponse.status === "success" && reportResponse.data) {
      reportData = reportResponse.data;
    }
  }

  const totals: {
    sum: number;
    discount: number;
  } = reportData.reduce(
    (acc, item) => {
      return {
        sum: acc.sum + item.totals.sum,
        discount: acc.discount + item.totals.discount,
      };
    },
    {
      sum: 0,
      discount: 0,
    },
  );

  const chartDataLabels = reportData.map((item) => item.manufacturer);
  const chartDataValues = reportData.map((item) => item.totals.sum);

  return (
    <div className="flex flex-col justify-center gap-2 p-4">
      <h1 className="my-2 flex justify-center text-xl font-semibold">
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

      {reportData.length === 0 && (
        <p className="text-center text-muted-foreground">
          Нет данных за выбранный период
        </p>
      )}

      {reportData.length > 0 && (
        <>
          <PieChart
            data={{
              labels: chartDataLabels,
              datasets: [
                {
                  data: chartDataValues,
                },
              ],
            }}
          />

          <div>
            {reportData.map((item) => {
              return (
                <ReportInnerTable
                  key={item.manufacturer}
                  title={item.manufacturer}
                  items={item.items}
                  totals={item.totals}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SalesByGoodsPage;
