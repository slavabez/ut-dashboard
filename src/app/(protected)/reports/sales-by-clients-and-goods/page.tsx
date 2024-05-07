import { BarChartHorizontal, ChevronsUpDown } from "lucide-react";
import React from "react";

import {
  IFormattedPartnerAndNomenclatureReportItem,
  getSalesByClientsAndGoods,
} from "@/actions/reports";
import { ReportsDateRangePicker } from "@/app/(protected)/reports/_components/reports-date-picker";
import { PageWrapper } from "@/components/layout-components";
import { H1, Large, Muted } from "@/components/typography";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface IReportDataItem {
  partner: string;
  manufacturers: {
    aggregates: any;
    items: IFormattedPartnerAndNomenclatureReportItem[];
    manufacturer: string;
  }[];
  aggregates: { quantity: number; discount: number; sum: number };
}

const processData = (
  data: Record<
    string,
    Record<string, IFormattedPartnerAndNomenclatureReportItem[]>
  >,
): IReportDataItem[] => {
  const processed = Object.entries(data).map(([partner, manufacturers]) => {
    const manufacturerArray = Object.entries(manufacturers).map(
      ([manufacturer, items]) => {
        const aggregates = items.reduce(
          (acc, item) => {
            acc.sum += item.sum;
            acc.quantity += item.quantity;
            acc.discount += item.discount;
            return acc;
          },
          { sum: 0, quantity: 0, discount: 0 },
        );

        return {
          manufacturer,
          items,
          aggregates,
        };
      },
    );

    // Sort manufacturers by sum in descending order
    manufacturerArray.sort((a, b) => b.aggregates.sum - a.aggregates.sum);

    const partnerAggregates = manufacturerArray.reduce(
      (acc, { aggregates }) => {
        acc.sum += aggregates.sum;
        acc.quantity += aggregates.quantity;
        acc.discount += aggregates.discount;
        return acc;
      },
      { sum: 0, quantity: 0, discount: 0 },
    );

    return {
      partner,
      manufacturers: manufacturerArray,
      aggregates: partnerAggregates,
    };
  });

  // Sort partners by sum in descending order
  processed.sort((a, b) => b.aggregates.sum - a.aggregates.sum);

  return processed;
};

// TODO: Refactor into smaller components

const SalesByClientsAndGoods = async ({
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

  let reportData: IReportDataItem[] = [];
  if (to && from) {
    const response = await getSalesByClientsAndGoods({
      startDate: from,
      endDate: to,
    });

    if (response.status === "error") {
      return (
        <PageWrapper>
          <H1>
            <BarChartHorizontal className="h-10 w-10" /> Продажи по клиентам и
            товарам
          </H1>
          <div className="text-center text-red-500">{response.error}</div>
        </PageWrapper>
      );
    }

    if (response.status === "success" && response.data) {
      reportData = processData(response.data);
    }
  }

  return (
    <PageWrapper>
      <H1>
        <BarChartHorizontal className="h-10 w-10" /> Продажи по клиентам и
        товарам
      </H1>
      <ReportsDateRangePicker searchParamName="range" title="Период" />

      <Separator />
      <Large>
        Общие продажи:{" "}
        <span className="font-bold">
          {formatPrice(
            reportData.reduce((acc, { aggregates }) => acc + aggregates.sum, 0),
          )}
        </span>
      </Large>
      <Large>
        Общая скидка:{" "}
        {formatPrice(
          reportData.reduce(
            (acc, { aggregates }) => acc + aggregates.discount,
            0,
          ),
        )}
      </Large>
      <Separator />
      {reportData.length === 0 && <Muted>Нет данных за выбранный период</Muted>}
      <div>
        {reportData.map(({ partner, manufacturers, aggregates }) => (
          <Collapsible key={partner}>
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 bg-orange-100 p-4">
              <div className="text-left">{partner}</div>
              <div className="flex gap-2 font-bold">
                {formatPrice(aggregates.sum)}
                <ChevronsUpDown />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {manufacturers.map(({ manufacturer, items, aggregates }) => (
                <Collapsible key={manufacturer}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 bg-orange-50 p-4">
                    <div className="text-left">{manufacturer}</div>
                    <div className="flex gap-2 font-bold">
                      {formatPrice(aggregates.sum)}
                      <ChevronsUpDown />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Table>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.nomenclature}>
                            <TableCell>{item.nomenclature}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              <span className="font-bold">
                                {formatPrice(item.sum)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CollapsibleContent>
                  <Separator className="bg-orange-300" />
                </Collapsible>
              ))}
            </CollapsibleContent>
            <Separator className="bg-orange-400" />
          </Collapsible>
        ))}
      </div>
    </PageWrapper>
  );
};

export default SalesByClientsAndGoods;
