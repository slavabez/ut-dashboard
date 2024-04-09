"use client";

import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSearchParamState } from "@/hooks/use-search-param-state";
import { cn, formatDateShort, getDateFor1C } from "@/lib/utils";

interface IReportsDateRangePickerProps {
  searchParamName: string;
  title: string;
  description?: string;
  className?: string;
}

export function ReportsDateRangePicker({
  searchParamName,
  description,
  className,
  title,
}: IReportsDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useSearchParamState<DateRange>({
    searchParamName,
    postSetCallback: () => {},
    serialize: (range) => {
      if (!range || !range.from || !range.to) return "";
      return `${getDateFor1C(range.from)}..${getDateFor1C(range.to)}`;
    },
    deserialize: (value) => {
      if (!value)
        return {
          from: new Date(),
          to: new Date(),
        };
      const [from, to] = value.split("..");
      return {
        from: new Date(from),
        to: new Date(to),
      };
    },
  });

  const renderDateRange = (date: DateRange) => {
    if (!date) return title;
    if (date.from && date.to) {
      return `${formatDateShort(date.from)} - ${formatDateShort(date.to)}`;
    }
    return formatDateShort(date.from ?? new Date());
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {renderDateRange(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date.from ?? new Date()}
            selected={date}
            locale={ru}
            onSelect={(value) => {
              if (value) {
                setDate(value);
              }
            }}
            onDayTouchMove={(day, activeModifiers, e) => {
              e.preventDefault();
              console.log(day, activeModifiers, e);
            }}
          />
        </PopoverContent>
      </Popover>
      {description && (
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
