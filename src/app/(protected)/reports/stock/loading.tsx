import { Warehouse } from "lucide-react";
import Link from "next/link";
import React from "react";

import ManufacturerSelect from "@/app/(protected)/reports/stock/_components/manufacturer-select";
import NameSearchInput from "@/app/(protected)/reports/stock/_components/name-search-input";
import PageWrapper from "@/components/layout-components";
import { H1, Muted, P } from "@/components/typography";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StockReportSkeleton = () => {
  return (
    <PageWrapper>
      <H1>
        <Warehouse className="h-10 w-10" />
        Остатки товаров на складе
      </H1>
      <P>Остатки обновлены: никогда</P>
      <ManufacturerSelect manufacturers={[]} />
      <NameSearchInput />
      <Muted>
        Товаров в наличии по выбранным критериям:{" "}
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
          <TableRow>
            <TableCell className="h-[100px] w-[100px] p-0">
              <Skeleton className="h-20 w-20" />
            </TableCell>
            <TableCell className="p-2">
              <Skeleton className="h-16 w-32" />
            </TableCell>
            <TableCell className="p-2">
              <Skeleton className="h-6 w-16" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="h-[100px] w-[100px] p-0">
              <Skeleton className="h-20 w-20" />
            </TableCell>
            <TableCell className="p-2">
              <Skeleton className="h-16 w-32" />
            </TableCell>
            <TableCell className="p-2">
              <Skeleton className="h-6 w-16" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="h-[100px] w-[100px] p-0">
              <Skeleton className="h-20 w-20" />
            </TableCell>
            <TableCell className="p-2">
              <Skeleton className="h-16 w-32" />
            </TableCell>
            <TableCell className="p-2">
              <Skeleton className="h-6 w-16" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="h-[100px] w-[100px] p-0">
              <Skeleton className="h-20 w-20" />
            </TableCell>
            <TableCell className="p-2">
              <Skeleton className="h-16 w-32" />
            </TableCell>
            <TableCell className="p-2">
              <Skeleton className="h-6 w-16" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </PageWrapper>
  );
};

export default StockReportSkeleton;
