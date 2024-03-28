"use client";

import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, getDateFor1C } from "@/lib/utils";

interface IOrderDatePickerProps {
  searchParamName: string;
  title: string;
  description?: string;
}

const OrderDatePicker = (props: IOrderDatePickerProps) => {
  const { title, searchParamName, description } = props;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const initialDate = searchParams.get(searchParamName);

  const handleSetDate = (date: Date | undefined) => {
    const newSearchParams = new URLSearchParams(searchParams);
    const newDate = getDateFor1C(date);
    newSearchParams.set(searchParamName, newDate);
    setIsOpen(false);
    router.push(`?${newSearchParams.toString()}`);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium">{title}</span>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full pl-3 text-left font-normal",
              !initialDate && "text-muted-foreground",
            )}
          >
            {initialDate ? initialDate : <span>Выберите дату</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={
              initialDate ? new Date(`${initialDate}T00:00:00`) : new Date()
            }
            onSelect={handleSetDate}
            initialFocus
            locale={ru}
          />
        </PopoverContent>
      </Popover>
      {description && (
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
      )}
    </div>
  );
};

export default OrderDatePicker;
