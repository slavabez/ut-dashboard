"use client";

import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState, useTransition } from "react";
import { CircleLayer, Marker } from "react-map-gl/maplibre";
import Map, { Layer, Source } from "react-map-gl/maplibre";

import { getOrdersForUserForDate } from "@/actions/orders";
import FormError from "@/components/form-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParamState } from "@/hooks/use-search-param-state";
import { IOrder } from "@/lib/1c-adapter";
import { UserSelectNonSensitive } from "@/lib/common-types";
import { cn, formatDateShort, getDateFor1C, isValidDate } from "@/lib/utils";

interface IEmployeeTrackerProps {
  employees: UserSelectNonSensitive[];
}

const pointsToPath = (points: any) => {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: points.map((point: any) => point.geometry.coordinates),
    },
  };
};

const orderToPoint = (order: IOrder): any => {
  return {
    type: "Feature",
    name: order.partner,
    geometry: {
      type: "Point",
      coordinates: [
        order.additionalProperties?.lon,
        order.additionalProperties?.lat,
      ],
    },
  };
};

// TODO: Refactor, fetch data on the page component

const EmployeeTracker = (props: IEmployeeTrackerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useSearchParamState<Date>({
    searchParamName: "date",
    postSetCallback: () => setIsOpen(false),
    serialize: getDateFor1C,
    deserialize: (value) => new Date(`${value}T00:00:00`),
  });
  const [employeeId, setEmployeeId] = useSearchParamState<string>({
    searchParamName: "user",
  });
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [points, setPoints] = useState<any[]>([]);
  const [path, setPath] = useState<any>();

  useEffect(() => {
    if (employeeId && selectedDate) {
      startTransition(() => {
        getOrdersForUserForDate(employeeId, getDateFor1C(selectedDate)).then(
          (data) => {
            if (data.status === "error") {
              setError(data.error);
            }
            if (data.status === "success") {
              setOrders(data.data);
              const points = data.data
                .filter((o) => {
                  return (
                    !!o.additionalProperties?.lon &&
                    !!o.additionalProperties?.lat
                  );
                })
                .map(orderToPoint);
              setPoints(points);
              setPath(pointsToPath(points));
            }
          },
        );
      });
    } else {
      setError("Выберите дату и пользователя");
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full pl-3 text-left font-normal",
              !selectedDate && "text-muted-foreground",
            )}
          >
            {isValidDate(selectedDate) ? (
              formatDateShort(selectedDate)
            ) : (
              <span>Выберите дату</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date);
              }
            }}
            initialFocus
            locale={ru}
          />
        </PopoverContent>
      </Popover>
      <Select onValueChange={setEmployeeId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите пользователя..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {props.employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id ?? ""}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FormError message={error} />
      <Map
        style={{ width: "100%", height: 600 }}
        mapStyle="https://api.maptiler.com/maps/streets/style.json?key=v2F8RKCf0TAnZymstnbL"
      >
        <Source id="path" type="geojson" data={path}>
          <Layer
            id="line"
            type="line"
            layout={{
              "line-join": "round",
              "line-cap": "round",
            }}
            paint={{
              "line-color": "#888",
              "line-width": 8,
            }}
          />
        </Source>
        {points.map((point, index) => (
          <Marker
            key={index}
            longitude={point.geometry.coordinates[0]}
            latitude={point.geometry.coordinates[1]}
            anchor="bottom"
          >
            {/* Customize your marker here, e.g., an SVG or an icon */}
            <Badge>{point.name}</Badge>
          </Marker>
        ))}
      </Map>
      <pre>{JSON.stringify(orders, null, 2)}</pre>
    </div>
  );
};

export default EmployeeTracker;
