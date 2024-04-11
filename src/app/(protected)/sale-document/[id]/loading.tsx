import { FileText, Package } from "lucide-react";
import Link from "next/link";
import React from "react";

import Order1cLink from "@/app/(protected)/orders/_components/order-1c-link";
import Sale1CLink from "@/app/(protected)/sale-document/_components/sale-1c-link";
import PageWrapper from "@/components/layout-components";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  format1CDocumentNumber,
  formatDateShort,
  formatPrice,
} from "@/lib/utils";

const SaleSkeleton = () => {
  return (
    <PageWrapper>
      <h1 className="my-4 flex justify-center gap-2 text-center text-xl font-semibold">
        <FileText /> Реализация №<Skeleton className="w-24" />
        <Sale1CLink saleId="00000000-0000-0000-0000-000000000000" />
      </h1>
      <Skeleton className="h-[74px] w-full" />
      <div className="flex flex-col gap-4">
        <dl className="flex justify-between">
          <dt className="text-gray-500">Клиент</dt>
          <dd className="text-right">
            <Skeleton className="h-6 w-28" />
          </dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Дата заказа</dt>
          <dd>
            <Skeleton className="h-6 w-28" />
          </dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Адрес доставки</dt>
          <dd className="text-right">
            <Skeleton className="h-6 w-28" />
          </dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Тип оплаты</dt>
          <dd>
            <Skeleton className="h-6 w-28" />
          </dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Комментарий</dt>
          <dd className="text-right">
            <Skeleton className="h-6 w-28" />
          </dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Сумма</dt>
          <dd className="font-bold">
            <Skeleton className="h-6 w-28" />
          </dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Заказ</dt>
          <dd className="font-bold">
            <Button asChild variant="secondary">
              <Link href={`/orders/00000000-0000-0000-0000-000000000000`}>
                Ссылка на заказ
              </Link>
            </Button>
          </dd>
        </dl>
      </div>
      <Separator className="my-4" />
      <Table>
        <TableHeader>
          <TableRow className="font-bold">
            <TableCell>Товар</TableCell>
            <TableCell>Кол-во</TableCell>
            <TableCell>Сумма (Скидка)</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={3}>
              <Skeleton className="h-10 w-full" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3}>
              <Skeleton className="h-10 w-full" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3}>
              <Skeleton className="h-10 w-full" />
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2} className="text-right font-bold">
              Итого
            </TableCell>
            <TableCell className="font-bold">
              <Skeleton className="h-6 w-28" />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </PageWrapper>
  );
};

export default SaleSkeleton;
