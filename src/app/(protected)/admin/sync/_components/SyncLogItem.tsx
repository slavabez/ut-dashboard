import React from "react";

import { SyncFormType } from "@/app/(protected)/admin/sync/_components/SyncForm";
import { Badge } from "@/components/ui/badge";
import { SyncLogSelect } from "@/drizzle/schema";
import { ISyncLogMeta } from "@/lib/sync";
import {
  formatDate,
  formatHoursAgo,
  formatRelativeDate,
  translateSyncType,
} from "@/lib/utils";

const renderBadge = (status: string) => {
  switch (status) {
    case "success":
      return <Badge variant="success">Успешно</Badge>;
    case "error":
      return <Badge variant="error">Ошибка</Badge>;
    default:
      return <Badge variant="warning">Пропуск</Badge>;
  }
};

const SyncLogItem = ({ item }: { item: SyncLogSelect }) => {
  const meta = item.metadata as ISyncLogMeta;
  return (
    <li className="shadow-lg rounded-lg border-[1px] border-orange-100 p-4">
      {renderBadge(item.status)}
      <div>Тип: {translateSyncType(item.type as SyncFormType)}</div>
      <div>{formatDate(item.createdAt)}</div>
      <div>{formatHoursAgo(item.createdAt)}</div>
      <div>Total from 1C: {meta?.entitiesFrom1C}</div>
    </li>
  );
};

export default SyncLogItem;
