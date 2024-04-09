import { Package } from "lucide-react";
import React from "react";

import { getOrderById } from "@/actions/orders";
import Order1cLink from "@/app/(protected)/orders/_components/order-1c-link";
import OrderStatusBadge from "@/app/(protected)/orders/_components/order-status-badge";
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
        <h1 className="my-2 text-center text-xl font-semibold">📦 Заказ</h1>
        <div className="text-center text-red-500">{orderResponse.error}</div>
      </div>
    );
  }

  const order = orderResponse.data;

  return (
    <div>
      <h1 className="my-4 flex justify-center gap-2 text-center text-xl font-semibold">
        <Package /> Заказ №{format1CDocumentNumber(order.number)}
        <Order1cLink orderId={order.id} />
      </h1>
      <div className="flex flex-col gap-4 px-4">
        <dl className="flex justify-between">
          <dt className="text-gray-500">Клиент</dt>
          <dd className="text-right">{order.partner}</dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Дата заказа</dt>
          <dd suppressHydrationWarning>{formatDateShort(order.date)}</dd>
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
            <dd suppressHydrationWarning>
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
          <dt className="text-gray-500">Комментарий</dt>
          <dd className="text-right">{order.comment}</dd>
        </dl>
        <dl className="flex justify-between">
          <dt className="text-gray-500">Сумма</dt>
          <dd className="font-bold">{formatPrice(order.sum)}</dd>
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
          {order.items.map((item) => {
            const totalDiscount = item.autoDiscount + item.manualDiscount;
            const totalDiscountPercent =
              (totalDiscount / (item.totalSum + totalDiscount)) * 100;

            return (
              <TableRow
                key={item.line}
                className={
                  item.cancelled ? "text-muted-foreground line-through" : ""
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
