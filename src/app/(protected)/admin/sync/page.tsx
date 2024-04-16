import React from "react";

import {
  getLatestSyncLogsAction,
  getTotalSyncLogsAction,
} from "@/actions/sync/common";
import SyncForm from "@/app/(protected)/admin/sync/_components/SyncForm";
import SyncLogEntries from "@/app/(protected)/admin/sync/_components/SyncLogEntries";
import { UniversalPagination } from "@/app/_components/universal-pagination";

const SyncMainPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = searchParams?.page;
  const currentPage = page ? parseInt(page as string) : 1;
  const totalSyncs = await getTotalSyncLogsAction();
  if (totalSyncs.status === "error") {
    throw new Error(totalSyncs.error ?? "Ошибка при получении данных");
  }
  const maxPage = Math.ceil(totalSyncs.data / 10);
  const latestSyncs = await getLatestSyncLogsAction({
    limit: 10,
    offset: (currentPage - 1) * 10,
  });
  if (latestSyncs.status === "error") {
    throw new Error(latestSyncs.error ?? "Ошибка при получении данных");
  }

  return (
    <div className="max-w-full">
      <SyncForm syncType="all" />
      <UniversalPagination
        currentPage={currentPage}
        totalPages={maxPage}
        baseRoute="/admin/sync"
      />
      <SyncLogEntries items={latestSyncs.data ?? []} />
      <UniversalPagination
        currentPage={currentPage}
        totalPages={maxPage}
        baseRoute="/admin/sync"
      />
    </div>
  );
};

export default SyncMainPage;
