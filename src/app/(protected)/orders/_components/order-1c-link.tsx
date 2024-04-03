"use client";

import { LinkIcon } from "lucide-react";
import React, { useState } from "react";

import { fromGuidTo1CId } from "@/lib/utils";

interface IOrder1cLinkProps {
  orderId: string;
}

const Order1cLink = (props: IOrder1cLinkProps) => {
  const { orderId } = props;
  const [clicked, setClicked] = useState(false);

  const link = `e1c://server/10.8.10.7/УТ#e1cib/data/Документ.ЗаказКлиента?ref=${fromGuidTo1CId(
    orderId,
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

export default Order1cLink;
