"use client";

import { ChevronsUpDown } from "lucide-react";
import React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";

interface IReportTableProps {
  title: string;
  items: {
    sum: number;
    quantity: number;
    discount: number;
    nomenclature: string;
  }[];
  totals: {
    sum: number;
    quantity: number;
    discount: number;
  };
}

const ReportInnerTable = (props: IReportTableProps) => {
  const { items, title, totals } = props;
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full justify-between bg-orange-50 p-4 font-bold">
        <div className="font-normal">{title}</div>
        <div className="flex gap-2">
          {formatPrice(totals.sum)}
          <ChevronsUpDown />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Table>
          <TableBody>
            {items.map((item) => {
              return (
                <TableRow key={item.nomenclature}>
                  <TableCell>{item.nomenclature}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <span className="font-bold">{formatPrice(item.sum)}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CollapsibleContent>
      <Separator className="bg-orange-400" />
    </Collapsible>
  );
};

export default ReportInnerTable;
