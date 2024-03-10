import React from "react";

import SyncForm from "@/app/(protected)/admin/sync/_components/SyncForm";
import SyncLogEntries from "@/app/(protected)/admin/sync/_components/SyncLogEntries";
import { UniversalPagination } from "@/app/_components/universal-pagination";

const SyncMeasurementUnitsPageSkeleton = () => {
  return (
    <div className="max-w-full">
      <SyncForm syncType="measurement-units" />
      <UniversalPagination
        currentPage={0}
        totalPages={0}
        baseRoute="/"
        skeleton
      />
      <SyncLogEntries items={[]} skeleton />
      <UniversalPagination
        currentPage={0}
        totalPages={0}
        baseRoute="/"
        skeleton
      />
    </div>
  );
};

export default SyncMeasurementUnitsPageSkeleton;
