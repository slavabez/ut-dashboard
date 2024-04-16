"use client";

import { Delete } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParamState } from "@/hooks/use-search-param-state";

const NameSearchInput = () => {
  const [currentName, setCurrentName] = useSearchParamState<string>({
    searchParamName: "name",
  });
  const form = useForm({
    defaultValues: {
      name: currentName,
    },
  });

  const onSubmit = (data: any) => {
    if (data) {
      form.setValue("name", data.name);
      setCurrentName(data.name);
    } else {
      form.setValue("name", "");
      setCurrentName("");
    }
  };

  const handleClear = () => {
    form.setValue("name", "");
    setCurrentName("");
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex w-full max-w-sm items-center space-x-2"
    >
      <Input
        type="name"
        placeholder="Наименование товара"
        {...form.register("name")}
      />
      <Button onClick={handleClear} variant="outline">
        <Delete />
      </Button>
      <Button type="submit">Поиск</Button>
    </form>
  );
};

export default NameSearchInput;
