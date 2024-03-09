import React from "react";

import SyncForm from "@/app/(protected)/admin/sync/_components/SyncForm";
import SyncLogEntries from "@/app/(protected)/admin/sync/_components/SyncLogEntries";
import { UniversalPagination } from "@/app/_components/universal-pagination";

const SyncAdminPageSkeleton = () => {
  return (
    <div className="max-w-full">
      <h1 className="text-2xl my-4 text-center">Раздел синхронизации</h1>
      <SyncForm syncType="all" />
      <UniversalPagination
        currentPage={0}
        totalPages={0}
        baseRoute="/admin/sync"
        skeleton
      />
      <SyncLogEntries items={[]} skeleton />
      <UniversalPagination
        currentPage={0}
        totalPages={0}
        baseRoute="/admin/sync"
        skeleton
      />
      <p className="text-center">Всего синхронизаций: 0</p>
    </div>
  );
};

export default SyncAdminPageSkeleton;
