import React from "react";

import { getNomenclatureHierarchy } from "@/actions/nomenclature/items";
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

const NomenclaturePage = async () => {
  const allHierarchy = await getNomenclatureHierarchy();
  return (
    <div>
      <h1>Номенклатура</h1>
      <DropdownMenu>
        <DropdownMenuTrigger>Меню</DropdownMenuTrigger>
        <DropdownMenuContent className="w-60 ">
          {allHierarchy.map((element) => DDMenuItem(element))}
        </DropdownMenuContent>
      </DropdownMenu>
      <pre>{JSON.stringify(allHierarchy, null, 2)}</pre>
    </div>
  );
};

export default NomenclaturePage;
