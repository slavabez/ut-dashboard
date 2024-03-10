import {
  CrossCircledIcon,
  PlusCircledIcon,
  ResetIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import React from "react";

import { SyncFormType } from "@/app/(protected)/admin/sync/_components/SyncForm";
import { OneCIcon } from "@/components/custom-icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SyncLogSelect } from "@/drizzle/schema";
import { ISyncLogMeta } from "@/lib/sync";
import { formatDate, formatRelativeDate, translateSyncType } from "@/lib/utils";

const renderBadge = (item: SyncLogSelect) => {
  let variant: "success" | "error" | "warning" = "success";
  if (item.status === "error") {
    variant = "error";
  } else if (item.status === "ignored") {
    variant = "warning";
  }
  const timeAgoText = formatRelativeDate(item.createdAt);
  const prettyDate = formatDate(item.createdAt);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge className="text-sm" variant={variant}>
            {timeAgoText}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{prettyDate}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const SyncLogItem = ({ item }: { item: SyncLogSelect }) => {
  const {
    entitiesMarkedDeleted,
    entitiesIgnored,
    entitiesUpdated,
    entitiesFrom1C,
    entitiesCreated,
  } = item.metadata as ISyncLogMeta;
  return (
    <Card>
      <CardHeader>
        <span className="text-md font-semibold flex justify-between">
          {translateSyncType(item.type as SyncFormType)}
          {renderBadge(item)}
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <div className="flex text-orange-500 justify-center items-center gap-1 font-semibold">
            <OneCIcon width={20} height={20} />
            {entitiesFrom1C}
          </div>
          <div className="flex text-emerald-500 justify-center items-center gap-1 font-semibold">
            <PlusCircledIcon width={20} height={20} />
            {entitiesCreated}
          </div>
          <div className="flex text-blue-500 justify-center items-center gap-1 font-semibold">
            <UpdateIcon width={20} height={20} />
            {entitiesUpdated}
          </div>
          <div className="flex text-destructive justify-center items-center gap-1 font-semibold">
            <CrossCircledIcon width={20} height={20} />
            {entitiesMarkedDeleted}
          </div>
          <div className="flex text-slate-500 justify-center items-center gap-1 font-semibold">
            <ResetIcon width={20} height={20} />
            {entitiesIgnored}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncLogItem;
