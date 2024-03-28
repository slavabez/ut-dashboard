import React from "react";

import { getOrderById } from "@/actions/orders";
import OrderStatusBadge from "@/app/(protected)/orders/_components/order-status-badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  format1CDocumentNumber,
  formatDateShort,
  formatPrice,
  translateDeliveryType,
} from "@/lib/utils";

const OrderDetailsPage = async ({
  params,
}: {
  params: { orderId: string };
}) => {
  const orderResponse = await getOrderById(params.orderId);
  if (orderResponse.status === "error") {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold text-center my-2">📦 Заказ</h1>
        <div className="text-center text-red-500">{orderResponse.error}</div>
      </div>
    );
  }

  const order = orderResponse.data;

  return (
    <div>
      <h1 className="text-xl font-semibold text-center my-2">
        📦 Заказ №{format1CDocumentNumber(order.number)}
      </h1>
      <div className="flex flex-col gap-4 px-4">
        <dl className="flex justify-between">
          <dt className="text-gray-500">Клиент</dt>
          <dd className="text-right">{order.partner}</dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Дата заказа</dt>
          <dd>{formatDateShort(order.date)}</dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Адрес доставки</dt>
          <dd className="text-right">{order.deliveryAddress}</dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Тип доставки</dt>
          <dd>{translateDeliveryType(order.deliveryType)}</dd>
        </dl>
        {order.deliveryType !== "Самовывоз" && (
          <dl className="flex justify-between">
            <dt className="text-gray-500">Дата доставки</dt>
            <dd>
              {formatDateShort(new Date(order.deliveryDate)).split(",")[0]}
            </dd>
          </dl>
        )}
        <dl className="flex justify-between">
          <dt className="text-gray-500">Статус</dt>
          <dd>
            <OrderStatusBadge order={order} />
          </dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Тип оплаты</dt>
          <dd>{order.paymentType}</dd>
        </dl>

        <dl className="flex justify-between">
          <dt className="text-gray-500">Сумма</dt>
          <dd className="font-bold">{formatPrice(order.sum)}</dd>
        </dl>
      </div>
      <Separator className="my-4" />
      <Table>
        <TableCaption>Товары</TableCaption>
        <TableHeader>
          <TableRow>
            <TableCell>Товар</TableCell>
            <TableCell>Кол-во</TableCell>
            <TableCell>Сумма (Скидка)</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => {
            const totalDiscount = item.autoDiscount + item.manualDiscount;
            const totalDiscountPercent = (totalDiscount / item.sum) * 100;

            return (
              <TableRow
                key={item.line}
                className={
                  item.cancelled ? "line-through text-muted-foreground" : ""
                }
              >
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
            <TableCell className="font-bold">
              {formatPrice(order.sum)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default OrderDetailsPage;
