import React from "react";

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
import { IOrder } from "@/lib/1c-adapter";
import { format1CDocumentNumber, formatPrice } from "@/lib/utils";

const TrackingOrderList = (props: { orders: IOrder[] }) => {
  const totalSum = props.orders.reduce((acc, current) => acc + current.sum, 0);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>№</TableHead>
          <TableHead>Клиент</TableHead>
          <TableHead>Сумма</TableHead>
          <TableHead>...</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.orders.map((order, index) => (
          <TableRow key={order.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{format1CDocumentNumber(order.number)}</TableCell>
            <TableCell>{order.partner}</TableCell>
            <TableCell>{formatPrice(order.sum)}</TableCell>
            <TableCell>...</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3} className="text-right">
            Общая сумма:
          </TableCell>
          <TableCell className="font-bold">{formatPrice(totalSum)}</TableCell>
          <TableCell>...</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default TrackingOrderList;
