"use client";

import { LinkIcon } from "lucide-react";
import React, { useState } from "react";

import { fromGuidTo1CId } from "@/lib/utils";

interface ISale1cLinkProps {
  saleId: string;
}

const Sale1CLink = (props: ISale1cLinkProps) => {
  const { saleId } = props;
  const [clicked, setClicked] = useState(false);

  const link = `e1c://server/10.8.10.7/УТ#e1cib/data/Документ.РеализацияТоваровУслуг?ref=${fromGuidTo1CId(
    saleId,
  )}`;

  return (
    <LinkIcon
      className={`cursor-pointer ${clicked ? "text-green-500" : "text-orange-500"}`}
      onClick={() => {
        // Copy to clipboard
        navigator.clipboard.writeText(link);
        setClicked(true);
      }}
    />
  );
};

export default Sale1CLink;
