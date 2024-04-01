import Image from "next/image";
import React from "react";

import { NomenclatureSelect } from "@/drizzle/schema";

const NomenclatureListItem = ({
  item,
}: {
  item: Partial<NomenclatureSelect>;
}) => {
  const image = item.coverImage
    ? `${process.env.NEXT_PUBLIC_FILE_URL}${item?.coverImage}`
    : "https://placehold.co/200";
  return (
    <li>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Image
            className="h-16 w-16 rounded-sm"
            src={image}
            alt={item.name ?? ""}
            width={64}
            height={64}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{item.name}</p>
          <p className="text-sm text-gray-500">{item.description}</p>
        </div>
        <div className="inline-flex items-center text-base font-semibold text-orange-500">
          {"н/у"}
        </div>
        {/*<pre>{JSON.stringify(item, null, 2)}</pre>*/}
      </div>
    </li>
  );
};

interface INomenclatureListProps {
  items: Partial<NomenclatureSelect>[];
}

const NomenclatureList = (props: INomenclatureListProps) => {
  const { items } = props;
  return (
    <ul className="flex max-w-full flex-col gap-4 py-8">
      {items.map((item) => (
        <NomenclatureListItem key={item.id} item={item} />
      ))}
    </ul>
  );
};

export default NomenclatureList;
