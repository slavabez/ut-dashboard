"use client";

import { LinkIcon } from "lucide-react";
import React, { useState } from "react";

import { fromGuidTo1CId } from "@/lib/utils";

interface INomenclature1cLinkProps {
  nomenclatureId: string;
}

const Nomenclature1cLink = (props: INomenclature1cLinkProps) => {
  const { nomenclatureId } = props;
  const [clicked, setClicked] = useState(false);

  const link = `e1c://server/10.8.10.7/УТ#e1cib/data/Справочник.Номенклатура?ref=${fromGuidTo1CId(
    nomenclatureId,
  )}`;

  return (
    <LinkIcon
      className={`cursor-pointer ${clicked ? "text-green-500" : "text-orange-500"}`}
      onClick={() => {
        navigator.clipboard.writeText(link);
        setClicked(true);
      }}
    />
  );
};

export default Nomenclature1cLink;
