import { getSpecificODataResponseArray } from "@/lib/odata/general";

export interface IPriceFields {
  Recorder: string;
  Цена: number;
  Period: string;
  Номенклатура_Key: string;
  Упаковка_Key: string;
}

export async function getAllPrices(priceId: string): Promise<IPriceFields[]> {
  return getSpecificODataResponseArray({
    path: "InformationRegister_ЦеныНоменклатуры_RecordType/SliceLast",
    select: "Recorder,Period,Цена,Упаковка_Key,Номенклатура_Key",
    filter: `ВидЦены_Key eq guid'${priceId}'`,
  }) as Promise<IPriceFields[]>;
}

export async function getPriceForNomenclature(
  nId: string,
  priceId: string,
): Promise<IPriceFields[]> {
  return getSpecificODataResponseArray({
    path: "InformationRegister_ЦеныНоменклатуры_RecordType/SliceLast",
    select: "Цена,Period,Упаковка_Key",
    filter: `Номенклатура_Key eq guid'${nId}' and ВидЦены_Key eq guid'${priceId}'`,
  }) as Promise<IPriceFields[]>;
}

export async function getAllPriceTypesFrom1C(): Promise<
  {
    Ref_Key: string;
    Description: string;
    Идентификатор: string;
    ВалютаЦены: {
      Description: string;
    };
  }[]
> {
  return getSpecificODataResponseArray({
    path: "Catalog_ВидыЦен",
    select: "Ref_Key,Description,Идентификатор,ВалютаЦены/Description",
    filter: `DeletionMark eq false and IsFolder eq false and ИспользоватьПриПродаже eq true`,
    expand: "ВалютаЦены",
  }) as Promise<
    {
      Ref_Key: string;
      Description: string;
      Идентификатор: string;
      ВалютаЦены: {
        Description: string;
      };
    }[]
  >;
}
