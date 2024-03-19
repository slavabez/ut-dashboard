"use client";

import React, { useState } from "react";

import FormComboBoxSelect from "@/app/(protected)/admin/nomenclature/_components/FormComboBoxSelect";
import { NomenclatureWithChildren } from "@/lib/common-types";

interface INomenclatureFilterListProps {
  items: Partial<NomenclatureWithChildren>[];
}

const NomenclatureFilterList = (props: INomenclatureFilterListProps) => {
  const { items } = props;
  return <FormComboBoxSelect label="Выберите группу (папку)" items={items} />;
};

export default NomenclatureFilterList;
