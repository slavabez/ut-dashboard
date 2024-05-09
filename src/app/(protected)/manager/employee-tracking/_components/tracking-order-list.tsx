import Link from "next/link";
import React, { RefObject } from "react";
import { MapRef } from "react-map-gl/maplibre";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IOrder } from "@/lib/1c-adapter";
import {
  format1CDocumentNumber,
  formatPrice,
  formatTime,
  fromGuidTo1CId,
} from "@/lib/utils";

const TrackingOrderList = (props: {
  orders: IOrder[];
  mapRef: RefObject<MapRef>;
}) => {
  const handleZoomToOrder = (order: IOrder) => {
    if (
      props.mapRef?.current &&
      order.additionalProperties?.lat &&
      order.additionalProperties.lon
    ) {
      props.mapRef.current.flyTo({
        zoom: 15,
        center: {
          lat: order.additionalProperties.lat,
          lng: order.additionalProperties.lon,
        },
      });
    }
  };

  const copy1CLinkToBuffer = (order: IOrder) => {
    const link = fromGuidTo1CId(order.id);
    navigator.clipboard.writeText(
      `e1c://server/10.8.10.7/УТ#e1cib/data/Документ.ЗаказКлиента?ref=${link}`,
    );
  };

  const totalSum = props.orders.reduce((acc, current) => acc + current.sum, 0);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>№</TableHead>
          <TableHead>Время</TableHead>
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
            <TableCell>
              {formatTime(order.additionalProperties?.started)} -{" "}
              {formatTime(order.additionalProperties?.finished)}
            </TableCell>
            <TableCell>{order.partner}</TableCell>
            <TableCell>{formatPrice(order.sum)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>...</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onSelect={() => {
                      handleZoomToOrder(order);
                    }}
                  >
                    Показать на карте
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      copy1CLinkToBuffer(order);
                    }}
                  >
                    Копировать 1С ссылку
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href={`/orders/${order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Открыть заказ
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
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
