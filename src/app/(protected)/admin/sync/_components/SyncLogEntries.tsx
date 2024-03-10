import {
  CrossCircledIcon,
  PlusCircledIcon,
  ResetIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import React from "react";
import { HiChevronUpDown } from "react-icons/hi2";

import SyncLogItem from "@/app/(protected)/admin/sync/_components/SyncLogItem";
import { OneCIcon } from "@/components/custom-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SyncLogSelect } from "@/drizzle/schema";

interface SyncLogEntriesProps {
  items: SyncLogSelect[];
  skeleton?: boolean;
}

const SyncLogEntries = ({ items, skeleton }: SyncLogEntriesProps) => {
  if (skeleton) {
    return (
      <ul className="p-2 flex flex-col gap-2">
        <li className="animate-pulse bg-gray-200 h-[124px] w-full rounded-md" />
        <li className="animate-pulse bg-gray-200 h-[124px] w-full rounded-md" />
        <li className="animate-pulse bg-gray-200 h-[124px] w-full rounded-md" />
        <li className="animate-pulse bg-gray-200 h-[124px] w-full rounded-md" />
        <li className="animate-pulse bg-gray-200 h-[124px] w-full rounded-md" />
      </ul>
    );
  }
  return (
    <ul className="p-2 flex flex-col gap-2">
      {items.map((item, i) => (
        <SyncLogItem item={item} key={i} />
      ))}
      <Collapsible>
        <CollapsibleTrigger className="flex w-full justify-between items-center gap-2 p-2 rounded-md">
          Показать разъяснения
          <HiChevronUpDown className="h-4 w-4" />
          <span className="sr-only">Toggle</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-wrap gap-2 p-2">
            <div className="flex text-orange-500 justify-center items-center gap-1 font-semibold">
              <OneCIcon width={20} height={20} />
              Кол-во объектов из 1С
            </div>
            <div className="flex text-emerald-500 justify-center items-center gap-1 font-semibold">
              <PlusCircledIcon width={20} height={20} />
              Создано объектов
            </div>
            <div className="flex text-blue-500 justify-center items-center gap-1 font-semibold">
              <UpdateIcon width={20} height={20} />
              Обновлено объектов
            </div>
            <div className="flex text-destructive justify-center items-center gap-1 font-semibold">
              <CrossCircledIcon width={20} height={20} />
              Удалено объектов
            </div>
            <div className="flex text-slate-500 justify-center items-center gap-1 font-semibold">
              <ResetIcon width={20} height={20} />
              Проигнорировано объектов
            </div>
            <Badge variant="success" className="text-sm">
              Успешная синхронизация
            </Badge>
            <Badge variant="warning" className="text-sm">
              Синхронизация пропущена
            </Badge>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </ul>
  );
};

export default SyncLogEntries;
