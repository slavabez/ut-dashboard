"use client";

import { ChevronsUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Fragment, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NomenclatureWithChildren } from "@/lib/common-types";
import { cn, flattenTree } from "@/lib/utils";

interface IFormComboBoxSelectProps {
  label: string;
  items: Partial<NomenclatureWithChildren>[];
}

const FormComboBoxSelect = (props: IFormComboBoxSelectProps) => {
  const { label, items } = props;
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const parentIds = searchParams.get("parentIds")?.split("_") || [];
  const selectedId = parentIds.length > 0 ? parentIds[0] : null;
  const flatTree = useMemo(() => {
    return flattenTree(items as any);
  }, [items]);
  const value = flatTree.find(
    (item) => item.id === selectedId,
  ) as Partial<NomenclatureWithChildren>;

  const navigateToNewParent = (newParentId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    const newParentIds = [newParentId];
    const newParent = flatTree.find((item) => item.id === newParentId);
    if (newParent?.children && newParent.children.length > 0) {
      newParentIds.push(...newParent.children.map((child: any) => child.id));
    }
    newSearchParams.set("parentIds", newParentIds.join("_"));
    router.push(`?${newSearchParams.toString()}`);
  };

  const renderCommandItem = (element: Partial<NomenclatureWithChildren>) => {
    if (element?.children && element.children.length > 0) {
      return (
        <Fragment key={element.id}>
          <CommandItem
            value={element.id}
            onSelect={(selectedParentId) => {
              navigateToNewParent(selectedParentId);
              setIsOpen(false);
            }}
            keywords={[element.name ?? ""]}
          >
            <Badge
              variant="outline"
              className="w-10 flex items-center justify-center"
            >
              {element.count}
            </Badge>
            {element.name}
          </CommandItem>
          <CommandGroup
            className="ml-2 border-l-[1px] border-l-slate-300"
            key={element.id}
          >
            {element.children.map((child) => renderCommandItem(child))}
          </CommandGroup>
        </Fragment>
      );
    } else {
      return (
        <CommandItem
          key={element.id}
          value={element.id}
          keywords={[element.name ?? ""]}
          className={cn("flex gap-2", {
            "bg-orange-100": value === element.id,
          })}
          onSelect={(selectedParentId) => {
            navigateToNewParent(selectedParentId);
            setIsOpen(false);
          }}
        >
          <Badge
            variant={value === element.id ? "default" : "outline"}
            className="w-10 flex items-center justify-center"
          >
            {element.count}
          </Badge>
          {element.name}
        </CommandItem>
      );
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[250px] justify-between"
          role="combobox"
          aria-expanded={isOpen}
        >
          {value?.name ?? label}
          <ChevronsUpDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] mx-2 p-0">
        <Command>
          <CommandInput placeholder={label} />
          <CommandEmpty>Нет данных</CommandEmpty>
          <CommandList>
            {items.map((item) => renderCommandItem(item))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default FormComboBoxSelect;
