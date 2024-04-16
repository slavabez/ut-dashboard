"use client";

import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ManufacturerSelect } from "@/drizzle/schema";
import { useSearchParamState } from "@/hooks/use-search-param-state";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IManufacturerSelectProps {
  manufacturers: Pick<ManufacturerSelect, "id" | "name">[];
}

const ManufacturerSelect = (props: IManufacturerSelectProps) => {
  const [id, setId] = useSearchParamState<string>({
    searchParamName: "manufacturerId",
  })


  const handleSelect = (newValue: string) => {
    setId(newValue);
  };

  const handleClear = () => {
    setId("");
  }

  return (
    <div className="flex gap-2">
      <Select onValueChange={handleSelect} value={id}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите производителя" />
        </SelectTrigger>
        <SelectContent>
          {props.manufacturers.map(m =>
            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}

        </SelectContent>
      </Select>
      <Button onClick={handleClear} variant="outline">
        <Delete />
      </Button>
    </div>

  );
};

export default ManufacturerSelect;
