import React from "react";

import { getLatestSyncLogs, getTotalSyncLogs } from "@/actions/sync/common";
import SyncForm from "@/app/(protected)/admin/sync/_components/SyncForm";
import SyncLogEntries from "@/app/(protected)/admin/sync/_components/SyncLogEntries";
import { UniversalPagination } from "@/app/_components/universal-pagination";

const SyncManufacturersPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const { page } = searchParams;
  const currentPage = page ? parseInt(page as string) : 1;
  const totalSyncs = await getTotalSyncLogs("manufacturers");
  if (totalSyncs.status === "error") {
    throw new Error(totalSyncs.error ?? "Ошибка при получении данных");
  }
  const maxPage = Math.ceil(totalSyncs.data / 10);
  const latestSyncs = await getLatestSyncLogs({
    limit: 10,
    offset: (currentPage - 1) * 10,
    type: "manufacturers",
  });
  if (latestSyncs.status === "error") {
    throw new Error(latestSyncs.error ?? "Ошибка при получении данных");
  }

  return (
    <div className="max-w-full">
      <SyncForm syncType="manufacturers" />
      <UniversalPagination
        currentPage={currentPage}
        totalPages={maxPage}
        baseRoute="/admin/sync/manufacturers"
      />
      <SyncLogEntries items={latestSyncs.data ?? []} />
      <UniversalPagination
        currentPage={currentPage}
        totalPages={maxPage}
        baseRoute="/admin/sync/manufacturers"
      />
    </div>
  );
};

export default SyncManufacturersPage;
