"use server";

import { and, asc, eq, gt, inArray, isNotNull } from "drizzle-orm";

import { injectCountsIntoNomenclature } from "@/data/nomenclature";
import { db } from "@/drizzle/db";
import { manufacturers, nomenclatures, prices } from "@/drizzle/schema";
import { IActionResponse, NomenclatureWithChildren } from "@/lib/common-types";
import { getLatestSiteSettings } from "@/lib/site-settings";
import { separateListIntoLevels, sortLevelsIntoTree } from "@/lib/utils";

export async function getManufacturerWithNomenclature(manufacturerId: string) {
  if (!manufacturerId) {
    return null;
  }
  return db.query.manufacturers.findFirst({
    where: eq(manufacturers.id, manufacturerId),
    with: {
      nomenclatures: true,
    },
  });
}

interface IItemFilter {
  manufacturerId?: string;
  parentIds?: string[];
  typeId?: string;
  isFolder?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  includeManufacturers?: boolean;
  includeMeasurementUnits?: boolean;
  includeType?: boolean;
}

export async function getNomenclatureItems(filter: IItemFilter) {
  const where = {
    manufacturerId: filter?.manufacturerId
      ? eq(nomenclatures.manufacturerId, filter.manufacturerId)
      : undefined,
    parentId: filter?.parentIds
      ? inArray(nomenclatures.parentId, filter.parentIds)
      : undefined,
    typeId: filter?.typeId
      ? eq(nomenclatures.typeId, filter.typeId)
      : undefined,
    isFolder:
      typeof filter?.isFolder === "boolean"
        ? eq(nomenclatures.isFolder, filter.isFolder)
        : undefined,
    inStock: filter?.inStock ? gt(nomenclatures.stock, 0) : undefined,
  };

  return db.query.nomenclatures.findMany({
    where: and(
      where.manufacturerId,
      where.parentId,
      where.typeId,
      where.isFolder,
      where.inStock,
      isNotNull(nomenclatures.coverImage),
    ),
    limit: filter.limit ?? 10,
    with: {
      manufacturer: filter?.includeManufacturers
        ? {
            columns: {
              id: true,
              name: true,
            },
          }
        : undefined,
      measurementUnits: filter?.includeMeasurementUnits ? true : undefined,
      type: filter?.includeType ? true : undefined,
    },
  });
}

export async function getNomenclatureHierarchy(): Promise<
  Partial<NomenclatureWithChildren>[]
> {
  const allFolders = await db.query.nomenclatures.findMany({
    where: eq(nomenclatures.isFolder, true),
    columns: {
      id: true,
      name: true,
      parentId: true,
    },
    orderBy: asc(nomenclatures.name),
  });

  const withCounts = await injectCountsIntoNomenclature(allFolders);

  // TODO: Implement a proper type conversion, need to add children: T[] and count: number to the type
  // Might need to ad Pick<> to the type
  const levels = separateListIntoLevels(withCounts);
  // @ts-ignore
  return sortLevelsIntoTree(levels);
}

export async function getNomenclatureInfo(
  id: string,
): Promise<IActionResponse<any>> {
  try {
    const siteSettings = await getLatestSiteSettings();
    let nom = await db.query.nomenclatures.findFirst({
      where: eq(nomenclatures.id, id),
      with: {
        manufacturer: true,
        measurementUnits: true,
        type: true,
        prices: true,
      },
    });

    if (nom?.coverImage) {
      nom.coverImage = process.env.NEXT_PUBLIC_FILE_URL + nom.coverImage;
    }

    const linkedPrices = nom?.prices.map((pr) => pr.priceId) ?? [];
    let priceInfo: any[] = [];

    if (linkedPrices.length > 0) {
      priceInfo = await db.query.prices.findMany({
        where: inArray(prices.id, linkedPrices),
        columns: {
          id: true,
          name: true,
        },
      });
    }
    let baseUnits = [
      {
        name: "Штука",
        id: siteSettings.guidsForSync.units.piece,
      },
      {
        name: "Килограмм",
        id: siteSettings.guidsForSync.units.kilogram,
      },
    ];

    return {
      status: "success",
      data: { nomenclature: nom, priceInfo, baseUnits },
    };
  } catch (e: any) {
    return {
      status: "error",
      error: e.message ?? e,
    };
  }
}
