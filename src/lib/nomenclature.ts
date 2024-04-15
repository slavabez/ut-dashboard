import { and, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { NomenclatureSelect, nomenclatures } from "@/drizzle/schema";
import { NomenclatureWithChildren } from "@/lib/common-types";

export async function getNomenclatureChildrenCount() {
  return db
    .select({
      parentId: nomenclatures.parentId,
      count: sql<number>`CAST(COUNT(*) as int)`,
    })
    .from(nomenclatures)
    .where(
      and(isNotNull(nomenclatures.parentId), eq(nomenclatures.isFolder, false)),
    )
    .groupBy(nomenclatures.parentId);
}

export async function injectCountsIntoNomenclature(
  allNomenclature: Partial<NomenclatureSelect>[],
): Promise<NomenclatureWithChildren[]> {
  const count = await getNomenclatureChildrenCount();
  // @ts-ignore TODO: fix this, need to add Pick<> to the type
  return allNomenclature.map((nomenclature) => {
    const countValue = count.find((c) => c.parentId === nomenclature.id);
    return {
      ...nomenclature,
      count: countValue?.count || 0,
      children: [],
    };
  });
}
