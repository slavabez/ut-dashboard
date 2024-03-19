import React, { Suspense } from "react";

import {
  getNomenclatureHierarchy,
  getNomenclatureItems,
} from "@/actions/nomenclature/items";
import FormComboBoxSelect from "@/app/(protected)/admin/nomenclature/_components/FormComboBoxSelect";
import NomenclatureFilterList from "@/app/(protected)/admin/nomenclature/_components/NomenclatureFilterList";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NomenclatureWithChildren } from "@/lib/common-types";

const DDSubMenuItem = (element: Partial<NomenclatureWithChildren>) => {
  if (element.children && element.children.length > 0) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Э</DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            {element.children.map((child) => (
              <DDMenuItem key={child.id} {...child} />
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  }
  return null;
};

const DDMenuItem = (element: Partial<NomenclatureWithChildren>) => {
  if (element?.count && element.count > 0) {
    return (
      <DropdownMenuItem>
        <span>{element.name}</span>
        <Badge>{element.count}</Badge>
        {DDSubMenuItem(element)}
      </DropdownMenuItem>
    );
  }
};

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
  });
  return (
    <div className="p-4">
      <h1>Номенклатура</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <NomenclatureFilterList items={allHierarchy} />
      </Suspense>

      <pre>
        {nomenclatureItems.map((item) => (
          <div key={item.id}>{item.name}</div>
        ))}
      </pre>
    </div>
  );
};

export default NomenclaturePage;
