import { getSpecificODataResponseArray } from "@/lib/odata/general";

export interface IAdditionalProperty {
  Ref_Key: string;
  DataVersion: string;
  Description: string;
  Имя: string;
  Заголовок: string;
}

export async function getAllAdditionalProperties(): Promise<
  IAdditionalProperty[]
> {
  return getSpecificODataResponseArray({
    path: "ChartOfCharacteristicTypes_ДополнительныеРеквизитыИСведения",
    select: "Ref_Key,DataVersion,Description,Имя,Заголовок",
    filter: `DeletionMark eq false`,
  }) as Promise<IAdditionalProperty[]>;
}

export interface IMainUnit {
  Ref_Key: string;
  DataVersion: string;
  Description: string;
  КодЭСФ: string;
}

export async function getMainUnits(): Promise<IMainUnit[]> {
  return getSpecificODataResponseArray({
    path: "Catalog_УпаковкиЕдиницыИзмерения",
    select: "Ref_Key,DataVersion,Description,КодЭСФ",
    filter: `КодЭСФ eq '796' or КодЭСФ eq '166'`,
  }) as Promise<IMainUnit[]>;
}

export interface IPropertyValue {
  Ref_Key: string;
  DataVersion: string;
  Description: string;
}

export async function getAllPropertyValues(): Promise<IPropertyValue[]> {
  return getSpecificODataResponseArray({
    path: "Catalog_ЗначенияСвойствОбъектов",
    select: "Ref_Key,DataVersion,Description",
    filter: `DeletionMark eq false`,
  }) as Promise<IPropertyValue[]>;
}
