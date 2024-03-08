import React from "react";

import SyncLogItem from "@/app/(protected)/admin/sync/_components/SyncLogItem";
import { SyncLogSelect } from "@/drizzle/schema";

const SyncLogEntries = ({ items }: { items: SyncLogSelect[] }) => {
  return (
    <ul className="p-2 flex flex-col gap-2">
      {items.map((item, i) => (
        <SyncLogItem item={item} key={i} />
      ))}
    </ul>
  );
};

export default SyncLogEntries;
