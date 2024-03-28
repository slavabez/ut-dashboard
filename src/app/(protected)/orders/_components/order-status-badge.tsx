import React from "react";

import { Badge } from "@/components/ui/badge";
import { IOrder } from "@/lib/1c-adapter";

const OrderStatusBadge = ({ order }: { order: IOrder }) => {
  if (order.deletionMark) {
    return <Badge variant="destructive">Удален</Badge>;
  }
  if (order.status === "НеСогласован") {
    return <Badge variant="outline">На согласовании</Badge>;
  }
  if (order.status === "КОбеспечению") {
    return <Badge variant="warning">В Резерве</Badge>;
  }
  if (order.status === "КОтгрузке") {
    return <Badge variant="success">Обработан</Badge>;
  }
  return <Badge variant="success">Закрыт</Badge>;
};

export default OrderStatusBadge;
