import { Package } from "lucide-react";
import React from "react";

import { getSalesByGoods } from "@/actions/reports";
import PieChart from "@/app/(protected)/reports/_components/pie-chart";
import ReportInnerTable from "@/app/(protected)/reports/_components/report-inner-table";
import { ReportsDateRangePicker } from "@/app/(protected)/reports/_components/reports-date-picker";
import PageWrapper from "@/components/layout-components";
import { H1, Large } from "@/components/typography";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
    <PageWrapper>
      <H1>
        <Package className="h-10 w-10" /> Продажи по товарам
      </H1>
      <ReportsDateRangePicker searchParamName="range" title="Период" />

      <Separator />
      <Large>
        Общие продажи:{" "}
        <span className="font-bold">{formatPrice(totals.sum)}</span>
      </Large>
      <Large>Общая скидка: {formatPrice(totals.discount)}</Large>
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
    </PageWrapper>
  );
};

export default SalesByGoodsPage;
