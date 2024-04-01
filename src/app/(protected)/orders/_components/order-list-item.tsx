import Link from "next/link";
import React from "react";

import OrderStatusBadge from "@/app/(protected)/orders/_components/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { IOrder } from "@/lib/1c-adapter";
import { format1CDocumentNumber, formatPrice } from "@/lib/utils";

const renderStatusBadge = (status: string, index: number) => {
  switch (status) {
    case "НеСогласован":
      return <Badge>{index}</Badge>;
    case "КОбеспечению":
      return <Badge variant="warning">{index}</Badge>;
    case "КОтгрузке":
    case "Закрыт":
      return <Badge variant="success">{index}</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const OrderListItem = ({ item, index }: { item: IOrder; index: number }) => {
  const {
    id,
    deletionMark,
    deliveryAddress,
    deliveryType,
    deliveryDate,
    paymentType,
    sum,
    partner,
    date,
    status,
    number,
  } = item;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-1">
          <Badge variant="outline">{index}</Badge>
          {format1CDocumentNumber(number)}
        </div>
        <OrderStatusBadge order={item} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <span className="font-semibold">{partner}</span>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button asChild>
          <Link href={`/orders/${id}`}>Подробнее</Link>
        </Button>
        <span className="font-semibold">{formatPrice(sum)}</span>
      </CardFooter>
    </Card>
  );
};

export default OrderListItem;
