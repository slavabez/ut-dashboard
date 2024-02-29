import { env } from "@/env.mjs";

export type ODataResponse =
  | {
      "odata.metadata": string;
      value: unknown[];
    }
  | {
      "odata.error": {
        code: string;
        message: {
          lang: string;
          value: string;
        };
      };
    };

export interface NomenclatureType1CFields {
  Ref_Key: string;
  DeletionMark: boolean;
  Parent_Key: string;
  IsFolder: boolean;
  Description: string;
  Описание: string;
  DataVersion: string;
}

export interface Nomenclature1CFields {
  Ref_Key: string;
  Parent_Key: string;
  IsFolder: boolean;
  Description: string;
  Code: string;
  Описание?: string;
  ВесИспользовать: boolean;
  ВидНоменклатуры_Key: string;
  ЕдиницаИзмерения_Key: string;
  Производитель_Key?: string;
  DataVersion: string;
  DeletionMark: boolean;
  ДополнительныеРеквизиты: {
    Ref_Key: string;
    Значение: string | number;
    Свойство_Key: string;
  }[];
}

export interface IFileFields {
  Ref_Key: string;
  Description: string;
  ВладелецФайла_Key: string;
}

export interface IBinaryFileFields {
  ДвоичныеДанныеФайла_Base64Data: string;
}

export interface IStockFields {
  ВНаличииBalance: number;
  ВРезервеСоСкладаBalance: number;
  ВРезервеПодЗаказBalance: number;
  Номенклатура_Key: string;
}

export interface IPriceFields {
  Recorder: string;
  Цена: number;
  Period: string;
  Номенклатура_Key: string;
  Упаковка_Key: string;
}

export interface IUnitFields {
  Ref_Key: string;
  Owner: string;
  Description: string;
  Вес: number;
  Числитель: number;
  Знаменатель: number;
  DataVersion: string;
  DeletionMark: boolean;
}

export interface Manufacturer1CFields {
  Ref_Key: string;
  IsFolder: boolean;
  Description: string;
  DataVersion: string;
  DeletionMark: boolean;
}

export async function getSpecificODataResponse({
  path,
  filter,
  select,
  expand,
  orderBy,
  top,
  skip,
}: {
  path: string;
  filter?: string;
  select?: string;
  expand?: string;
  orderBy?: string;
  top?: number;
  skip?: number;
}) {
  const authHeader = env.ODATA_API_AUTH_HEADER;
  const baseUrl = env.ODATA_API_URL;

  // Cannot use URLParams because it encodes and breaks the OData query
  let params = `$format=json`;
  if (filter) {
    params = `${params}&$filter=${filter}`;
  }
  if (select) {
    params = `${params}&$select=${select}`;
  }
  if (expand) {
    params = `${params}&$expand=${expand}`;
  }
  if (orderBy) {
    params = `${params}&$orderby=${orderBy}`;
  }
  if (top) {
    params = `${params}&$top=${top}`;
  }
  if (skip) {
    params = `${params}&$skip=${skip}`;
  }
  try {
    // Use fetch to get the response from the OData API
    const response = await fetch(`${baseUrl}${path}?${params}`, {
      headers: {
        Authorization: authHeader,
      },
    });
    // Get the JSON response from the OData API
    const odataResponse: ODataResponse =
      (await response.json()) as ODataResponse;
    // Check if the response is an error
    if ("odata.error" in odataResponse) {
      throw new Error(odataResponse["odata.error"].message.value);
    }
    return odataResponse.value;
  } catch (e) {
    console.error("Error while getting OData response", e);
    throw e;
  }
}

export class From1C {
  static async getAllNomenclatureTypes(): Promise<NomenclatureType1CFields[]> {
    return getSpecificODataResponse({
      path: "Catalog_ВидыНоменклатуры",
      select:
        "Ref_Key,DeletionMark,Parent_Key,IsFolder,Description,Описание,DataVersion",
      //filter: `DeletionMark eq false`,
      orderBy: "IsFolder desc",
    }) as Promise<NomenclatureType1CFields[]>;
  }

  static async getAllNomenclatureItems(): Promise<Nomenclature1CFields[]> {
    return getSpecificODataResponse({
      path: "Catalog_Номенклатура",
      select:
        "Ref_Key,Parent_Key,IsFolder,ВидНоменклатуры_Key,Description,Code,Описание,ЕдиницаИзмерения_Key,Производитель_Key,DataVersion,DeletionMark,ДополнительныеРеквизиты/Ref_Key,ДополнительныеРеквизиты/Значение,ДополнительныеРеквизиты/Свойство_Key",
      filter: `DeletionMark eq false`,
      orderBy: "IsFolder desc",
    }) as Promise<Nomenclature1CFields[]>;
  }

  static async getNomenclatureByType(
    typeId: string,
  ): Promise<Nomenclature1CFields[]> {
    return getSpecificODataResponse({
      path: "Catalog_Номенклатура",
      select:
        "Ref_Key,Parent_Key,IsFolder,Code,Description,ЕдиницаИзмерения_Key,Производитель_Key",
      filter: `DeletionMark eq false and ВидНоменклатуры_Key eq guid'${typeId}'`,
    }) as Promise<Nomenclature1CFields[]>;
  }

  static async getNomenclatureItem(
    nId: string,
  ): Promise<Nomenclature1CFields[]> {
    return getSpecificODataResponse({
      path: "Catalog_Номенклатура",
      select:
        "Ref_Key,Parent_Key,IsFolder,Code,Description,ЕдиницаИзмерения_Key,Производитель_Key",
      filter: `DeletionMark eq false and Ref_Key eq guid'${nId}'`,
    }) as Promise<Nomenclature1CFields[]>;
  }

  static async getNomenclatureFiles(nId: string): Promise<IFileFields[]> {
    return getSpecificODataResponse({
      path: "Catalog_НоменклатураПрисоединенныеФайлы",
      select: "Ref_Key,ВладелецФайла_Key,Description",
      filter: `DeletionMark eq false and ВладелецФайла_Key eq guid'${nId}'`,
    }) as Promise<IFileFields[]>;
  }

  static async getNomenclatureFilesBinary(
    fId: string,
  ): Promise<IBinaryFileFields[]> {
    return getSpecificODataResponse({
      path: "InformationRegister_ДвоичныеДанныеФайлов",
      select: "ДвоичныеДанныеФайла_Base64Data",
      filter: `Файл eq cast(guid'${fId}', 'Catalog_НоменклатураПрисоединенныеФайлы')`,
    }) as Promise<IBinaryFileFields[]>;
  }

  static async getAllStock(): Promise<IStockFields[]> {
    const warehouseId = env.MAIN_WAREHOUSE_UUID;
    return getSpecificODataResponse({
      path: "AccumulationRegister_СвободныеОстатки/Balance(Dimensions='Номенклатура,Склад')",
      filter: `Склад_Key eq guid'${warehouseId}'`,
      select:
        "ВНаличииBalance,ВРезервеСоСкладаBalance,ВРезервеПодЗаказBalance,Номенклатура_Key",
    }) as Promise<IStockFields[]>;
  }

  static async getStockForNomenclature(nId: string): Promise<IStockFields[]> {
    const warehouseId = env.MAIN_WAREHOUSE_UUID;
    return getSpecificODataResponse({
      path: "AccumulationRegister_СвободныеОстатки/Balance",
      filter: `Номенклатура_Key eq guid'${nId}' and Склад_Key eq guid'${warehouseId}'`,
    }) as Promise<IStockFields[]>;
  }

  static async getAllPrices(): Promise<IPriceFields[]> {
    const priceTypeId = env.MAIN_PRICE_TYPE_UUID;
    return getSpecificODataResponse({
      path: "InformationRegister_ЦеныНоменклатуры_RecordType/SliceLast",
      select: "Recorder,Period,Цена,Упаковка_Key,Номенклатура_Key",
      filter: `ВидЦены_Key eq guid'${priceTypeId}'`,
    }) as Promise<IPriceFields[]>;
  }

  static async getPriceForNomenclature(nId: string): Promise<IPriceFields[]> {
    const priceTypeId = env.MAIN_PRICE_TYPE_UUID;
    return getSpecificODataResponse({
      path: "InformationRegister_ЦеныНоменклатуры_RecordType/SliceLast",
      select: "Цена,Period,Упаковка_Key",
      filter: `Номенклатура_Key eq guid'${nId}' and ВидЦены_Key eq guid'${priceTypeId}'`,
    }) as Promise<IPriceFields[]>;
  }

  static async getNomenclatureMeasurementUnits(
    nId: string,
  ): Promise<IUnitFields[]> {
    return getSpecificODataResponse({
      path: "Catalog_УпаковкиЕдиницыИзмерения",
      select: "Ref_Key,Description,Вес,Числитель,Знаменатель",
      filter: `Owner eq cast(guid'${nId}', 'Catalog_Номенклатура')`,
    }) as Promise<IUnitFields[]>;
  }

  static async getAllManufacturers(): Promise<Manufacturer1CFields[]> {
    return getSpecificODataResponse({
      path: "Catalog_Производители",
      select: "Ref_Key,DataVersion,DeletionMark,IsFolder,Description",
      filter: `IsFolder eq false`,
    }) as Promise<Manufacturer1CFields[]>;
  }
}
