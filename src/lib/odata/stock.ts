import { getSpecificODataResponseArray } from "@/lib/odata/general";
import { getLatestSiteSettings } from "@/lib/site-settings";

export interface IStockFields {
  ВНаличииBalance: number;
  ВРезервеСоСкладаBalance: number;
  ВРезервеПодЗаказBalance: number;
  Номенклатура_Key: string;
}

export async function getAllStock(): Promise<IStockFields[]> {
  const guids = await getLatestSiteSettings();
  const warehouseId = guids.guidsForSync.warehouse;
  return getSpecificODataResponseArray({
    path: "AccumulationRegister_СвободныеОстатки/Balance(Dimensions='Номенклатура,Склад')",
    filter: `Склад_Key eq guid'${warehouseId}'`,
    select:
      "ВНаличииBalance,ВРезервеСоСкладаBalance,ВРезервеПодЗаказBalance,Номенклатура_Key",
  }) as Promise<IStockFields[]>;
}

export async function getStockForNomenclature(
  nId: string,
): Promise<IStockFields[]> {
  const guids = await getLatestSiteSettings();
  const warehouseId = guids.guidsForSync.warehouse;
  return getSpecificODataResponseArray({
    path: "AccumulationRegister_СвободныеОстатки/Balance",
    filter: `Номенклатура_Key eq guid'${nId}' and Склад_Key eq guid'${warehouseId}'`,
  }) as Promise<IStockFields[]>;
}

export async function getAllWarehouses(): Promise<
  {
    Ref_Key: string;
    Description: string;
  }[]
> {
  return getSpecificODataResponseArray({
    path: "Catalog_Склады",
    select: "Ref_Key,Description",
    filter: `DeletionMark eq false and IsFolder eq false`,
  }) as Promise<
    {
      Ref_Key: string;
      Description: string;
    }[]
  >;
}
