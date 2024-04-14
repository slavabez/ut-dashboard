"use client";

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
    mode: "onChange",
  });

  const onSubmit = (data: any) => {
    if (data) {
      setCurrentName(data.name);
    } else {
      setCurrentName("");
    }
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
      <Button disabled={!form.formState.isDirty} type="submit">
        Поиск
      </Button>
    </form>
  );
};

export default NameSearchInput;
