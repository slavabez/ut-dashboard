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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SyncLogEntriesProps {
  items: any[];
  skeleton?: boolean;
}

const SyncLogEntries = ({ items, skeleton }: SyncLogEntriesProps) => {
  if (skeleton) {
    return (
      <ul className="flex flex-col gap-2 p-2">
        <li className="h-[124px] w-full animate-pulse rounded-md bg-gray-200" />
        <li className="h-[124px] w-full animate-pulse rounded-md bg-gray-200" />
        <li className="h-[124px] w-full animate-pulse rounded-md bg-gray-200" />
        <li className="h-[124px] w-full animate-pulse rounded-md bg-gray-200" />
        <li className="h-[124px] w-full animate-pulse rounded-md bg-gray-200" />
      </ul>
    );
  }
  return (
    <ul className="flex flex-col gap-2 p-2">
      {items.map((item, i) => (
        <SyncLogItem item={item} key={i} />
      ))}
      <Collapsible>
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-md p-2">
          Показать разъяснения
          <HiChevronUpDown className="h-4 w-4" />
          <span className="sr-only">Toggle</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-wrap gap-2 p-2">
            <div className="flex items-center justify-center gap-1 font-semibold text-orange-500">
              <OneCIcon width={20} height={20} />
              Кол-во объектов из 1С
            </div>
            <div className="flex items-center justify-center gap-1 font-semibold text-emerald-500">
              <PlusCircledIcon width={20} height={20} />
              Создано объектов
            </div>
            <div className="flex items-center justify-center gap-1 font-semibold text-blue-500">
              <UpdateIcon width={20} height={20} />
              Обновлено объектов
            </div>
            <div className="flex items-center justify-center gap-1 font-semibold text-destructive">
              <CrossCircledIcon width={20} height={20} />
              Удалено объектов
            </div>
            <div className="flex items-center justify-center gap-1 font-semibold text-slate-500">
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
