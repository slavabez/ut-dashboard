import { ChevronsUpDown } from "lucide-react";
import React from "react";

import { ISaleReportItem } from "@/actions/sale-document";
import LinkButton from "@/components/link-button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  format1CDocumentNumber,
  formatDateShort,
  formatPrice,
} from "@/lib/utils";

interface IDebtReportItemProps {
  item: {
    counterpartyId: string;
    counterpartyName: string;
    totalDebt: number;
    documents: ISaleReportItem[];
  };
}

const DebtReportItem = ({ item }: IDebtReportItemProps) => {
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full justify-between border-b-2 bg-orange-50 p-4 font-bold">
        <div className="text-left font-normal">
          {item.counterpartyName} ({item.documents.length})
        </div>
        <div className="flex gap-2">
          {formatPrice(item.totalDebt)}
          <ChevronsUpDown />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul>
          {item.documents.map((document) => (
            <li
              key={document.id}
              className="flex justify-between border-b-2 p-2"
            >
              <div>
                <div className="">
                  Реализация{" "}
                  <span className="font-bold">
                    №{format1CDocumentNumber(document.number)}
                  </span>{" "}
                  от {formatDateShort(new Date(document.date))}
                </div>
                <div className="text-muted-foreground">
                  Долг по документу:{" "}
                  <span className="font-bold text-black">
                    {formatPrice(document.debtAmount ?? 0)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <LinkButton href={`/sale-document/${document.id}`}>
                  Подробнее
                </LinkButton>
              </div>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DebtReportItem;
