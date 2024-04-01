import React, { Suspense } from "react";

import {
  getNomenclatureHierarchy,
  getNomenclatureItems,
} from "@/actions/nomenclature/items";
import NomenclatureFilterList from "@/app/(protected)/admin/nomenclature/_components/NomenclatureFilterList";
import NomenclatureList from "@/app/(protected)/admin/nomenclature/_components/NomenclatureList";

const NomenclaturePage = async ({
  searchParams,
}: {
  searchParams: {
    parentIds?: string;
  };
}) => {
  const allHierarchy = await getNomenclatureHierarchy();
  const nomenclatureItems = await getNomenclatureItems({
    parentIds: searchParams.parentIds?.split("_").filter((i) => i !== ""),
    isFolder: false,
    limit: 80,
  });
  return (
    <div className="p-4">
      <h1 className="pb-4 text-center text-2xl">Номенклатура</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <NomenclatureFilterList items={allHierarchy} />
      </Suspense>

      <NomenclatureList items={nomenclatureItems} />
    </div>
  );
};

export default NomenclaturePage;
