import React from "react";

import SyncLogItem from "@/app/(protected)/admin/sync/_components/SyncLogItem";
import { SyncLogSelect } from "@/drizzle/schema";

interface SyncLogEntriesProps {
  items: SyncLogSelect[];
  skeleton?: boolean;
}

const SyncLogEntries = ({ items, skeleton }: SyncLogEntriesProps) => {
  if (skeleton) {
    return (
      <ul className="p-2 flex flex-col gap-2">
        <li className="animate-pulse bg-gray-200 h-10 w-full rounded-md" />
        <li className="animate-pulse bg-gray-200 h-10 w-full rounded-md" />
        <li className="animate-pulse bg-gray-200 h-10 w-full rounded-md" />
        <li className="animate-pulse bg-gray-200 h-10 w-full rounded-md" />
        <li className="animate-pulse bg-gray-200 h-10 w-full rounded-md" />
      </ul>
    );
  }
  return (
    <ul className="p-2 flex flex-col gap-2">
      {items.map((item, i) => (
        <SyncLogItem item={item} key={i} />
      ))}
    </ul>
  );
};

export default SyncLogEntries;
