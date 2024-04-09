import React from "react";

import OrderStatusBadge from "@/app/(protected)/orders/_components/order-status-badge";
import LinkButton from "@/components/link-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { IOrder } from "@/lib/1c-adapter";
import { format1CDocumentNumber, formatPrice } from "@/lib/utils";

const OrderListItem = ({ item, index }: { item: IOrder; index: number }) => {
  const { id, sum, partner, number } = item;
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
        <LinkButton href={`/orders/${id}`}>Подробнее</LinkButton>
        <span className="font-semibold">{formatPrice(sum)}</span>
      </CardFooter>
    </Card>
  );
};

export default OrderListItem;
