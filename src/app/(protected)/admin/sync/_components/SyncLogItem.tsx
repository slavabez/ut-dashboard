import React from "react";

import { SyncLogSelect } from "@/drizzle/schema";
import { ISyncLogMeta } from "@/lib/common-types";

const SyncLogItem = ({ item }: { item: SyncLogSelect }) => {
  const meta = item.metadata as ISyncLogMeta;
  return (
    <li className="shadow-lg rounded-lg border-[1px] border-orange-100 p-4">
      <div>Status: {item.status}</div>
      <div>Type: {item.type}</div>
      <div>Date: {item.createdAt.toLocaleDateString()}</div>
      <div>Total from 1C: {meta?.entitiesFrom1C}</div>
    </li>
  );
};

export default SyncLogItem;
