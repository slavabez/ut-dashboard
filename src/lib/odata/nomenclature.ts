import { getSpecificODataResponseArray } from "@/lib/odata/general";

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

export async function getAllNomenclatureTypes(): Promise<
  NomenclatureType1CFields[]
> {
  return getSpecificODataResponseArray({
    path: "Catalog_ВидыНоменклатуры",
    select:
      "Ref_Key,DeletionMark,Parent_Key,IsFolder,Description,Описание,DataVersion",
    //filter: `DeletionMark eq false`,
    orderBy: "IsFolder desc",
  }) as Promise<NomenclatureType1CFields[]>;
}

export async function getAllNomenclatureItems(): Promise<
  Nomenclature1CFields[]
> {
  return getSpecificODataResponseArray({
    path: "Catalog_Номенклатура",
    select:
      "Ref_Key,Parent_Key,IsFolder,ВидНоменклатуры_Key,Description,Code,Описание,ЕдиницаИзмерения_Key,Производитель_Key,DataVersion,DeletionMark,ДополнительныеРеквизиты/Ref_Key,ДополнительныеРеквизиты/Значение,ДополнительныеРеквизиты/Свойство_Key",
    filter: `DeletionMark eq false`,
    orderBy: "IsFolder desc",
  }) as Promise<Nomenclature1CFields[]>;
}

export async function getNomenclatureByType(
  typeId: string,
): Promise<Nomenclature1CFields[]> {
  return getSpecificODataResponseArray({
    path: "Catalog_Номенклатура",
    select:
      "Ref_Key,Parent_Key,IsFolder,Code,Description,ЕдиницаИзмерения_Key,Производитель_Key",
    filter: `DeletionMark eq false and ВидНоменклатуры_Key eq guid'${typeId}'`,
  }) as Promise<Nomenclature1CFields[]>;
}

export async function getNomenclatureItem(
  nId: string,
): Promise<Nomenclature1CFields[]> {
  return getSpecificODataResponseArray({
    path: "Catalog_Номенклатура",
    select:
      "Ref_Key,Parent_Key,IsFolder,Code,Description,ЕдиницаИзмерения_Key,Производитель_Key",
    filter: `DeletionMark eq false and Ref_Key eq guid'${nId}'`,
  }) as Promise<Nomenclature1CFields[]>;
}

export interface IFileFields {
  Ref_Key: string;
  ПутьКФайлу: string;
  ВладелецФайла_Key: string;
}

export async function getAllNomenclatureFiles(): Promise<IFileFields[]> {
  return getSpecificODataResponseArray({
    path: "Catalog_НоменклатураПрисоединенныеФайлы",
    select: "Ref_Key,ПутьКФайлу,ВладелецФайла_Key",
    filter: `DeletionMark eq false`,
  }) as Promise<IFileFields[]>;
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

export async function getNomenclatureMeasurementUnits(
  nId: string,
): Promise<IUnitFields[]> {
  return getSpecificODataResponseArray({
    path: "Catalog_УпаковкиЕдиницыИзмерения",
    select: "Ref_Key,Description,Вес,Числитель,Знаменатель",
    filter: `Owner eq cast(guid'${nId}', 'Catalog_Номенклатура')`,
  }) as Promise<IUnitFields[]>;
}

export async function getAllMeasurementUnits(): Promise<IUnitFields[]> {
  return getSpecificODataResponseArray({
    path: "Catalog_УпаковкиЕдиницыИзмерения",
    select:
      "Ref_Key,Description,DeletionMark,DataVersion,Owner,Вес,Числитель,Знаменатель",
  }) as Promise<IUnitFields[]>;
}

export interface Manufacturer1CFields {
  Ref_Key: string;
  IsFolder: boolean;
  Description: string;
  DataVersion: string;
  DeletionMark: boolean;
}

export async function getAllManufacturers(): Promise<Manufacturer1CFields[]> {
  return getSpecificODataResponseArray({
    path: "Catalog_Производители",
    select: "Ref_Key,DataVersion,DeletionMark,IsFolder,Description",
    filter: `IsFolder eq false`,
  }) as Promise<Manufacturer1CFields[]>;
}
