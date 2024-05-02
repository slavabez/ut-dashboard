import { FileText } from "lucide-react";
import Link from "next/link";
import React from "react";

import { getSaleDocumentDetails } from "@/actions/sale-document";
import Sale1CLink from "@/app/(protected)/sale-document/_components/sale-1c-link";
import PageWrapper from "@/components/layout-components";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

export const dynamic = "force-dynamic";

const renderDebtAlert = (debt: number) => {
  if (!debt || debt === 0) {
    return (
      <Alert variant="success">
        <AlertTitle>Документ оплачен</AlertTitle>
        <AlertDescription>
          Задолженности по документу не найдено
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert variant="destructive">
      <AlertTitle>Документ не оплачен</AlertTitle>
      <AlertDescription>
        Задолженность по документу:{" "}
        <span className="font-bold">{formatPrice(debt)}</span>
      </AlertDescription>
    </Alert>
  );
};

const SaleDocumentDetails = async ({ params }: { params: { id: string } }) => {
  const saleResponse = await getSaleDocumentDetails(params.id);
  if (saleResponse.status === "error") {
    return (
      <PageWrapper>
        <h1 className="my-4 flex justify-center gap-2 text-center text-xl font-semibold">
          <FileText /> Реализация не найдена
        </h1>
        <div className="text-center text-red-500">{saleResponse.error}</div>
      </PageWrapper>
    );
  }

  const sale = saleResponse.data;

  return (
    <PageWrapper>
      <h1 className="my-4 flex justify-center gap-2 text-center text-xl font-semibold">
        <FileText /> Реализация №{format1CDocumentNumber(sale.number)}
        <Sale1CLink saleId={sale.id} />
      </h1>
      {renderDebtAlert(sale?.debt ?? 0)}
      <div className="flex flex-col gap-4">
        <dl className="flex justify-between">
          <dt className="text-gray-500">Клиент</dt>
          <dd className="text-right">{sale.partner}</dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Дата заказа</dt>
          <dd suppressHydrationWarning>{formatDateShort(sale.date)}</dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Адрес доставки</dt>
          <dd className="text-right">{sale.deliveryAddress}</dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Тип оплаты</dt>
          <dd>{sale.paymentType}</dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Комментарий</dt>
          <dd className="text-right">{sale.comment}</dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Сумма</dt>
          <dd className="font-bold">{formatPrice(sale.sum)}</dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Заказ</dt>
          <dd className="font-bold">
            <Button asChild variant="secondary">
              <Link href={`/orders/${sale.orderId}`}>Ссылка на заказ</Link>
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
          {sale.items.map((item) => {
            const totalDiscount = item.autoDiscount + item.manualDiscount;
            const totalDiscountPercent =
              (totalDiscount / (item.totalSum + totalDiscount)) * 100;

            return (
              <TableRow key={item.line}>
                <TableCell>{item.nomenclatureName}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <span className="font-bold">{formatPrice(item.sum)}</span>
                  {totalDiscount > 1 &&
                    ` (${formatPrice(totalDiscount)} - ${totalDiscountPercent.toFixed(2)}%)`}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2} className="text-right font-bold">
              Итого
            </TableCell>
            <TableCell className="font-bold">{formatPrice(sale.sum)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </PageWrapper>
  );
};

export default SaleDocumentDetails;
