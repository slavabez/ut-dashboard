import { getGlobalSettings } from "@/actions/site-settings";
import { env } from "@/env.mjs";

export type ODataResponseArray =
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

export type ODataResponseObject =
  | {
      "odata.metadata": string;
      [key: string]: any;
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
  ПутьКФайлу: string;
  ВладелецФайла_Key: string;
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

export interface IOrderFields {
  Ref_Key: string;
  Number: string;
  Date: string;
  СуммаДокумента: number;
  Статус: string;
  ФормаОплаты: string;
  ДатаОтгрузки: string;
  АдресДоставки: string;
  СпособДоставки: string;
  Комментарий: string;
  Партнер: {
    Description: string;
  };
  DeletionMark: boolean;
}

export interface IOrderContentFields {
  LineNumber: number;
  Количество: number;
  Номенклатура_Key: string;
  Цена: number;
  Цена_Key: string;
  Сумма: number;
  СуммаНДС: number;
  СуммаСНДС: number;
  СуммаРучнойСкидки: number;
  СуммаАвтоматическойСкидки: number;
  Отменено: boolean;
  Номенклатура: {
    Description: string;
  };
}

export interface ISalesByPartnersFields {
  КоличествоTurnover: number;
  СуммаВыручкиTurnover: number;
  СуммаАвтоматическойСкидкиTurnover: number;
  СуммаРучнойСкидкиTurnover: number;
  АналитикаУчетаПоПартнерам: {
    Партнер: {
      Description: string;
    };
    Контрагент: string;
  };
}

export interface ISalesByNomenclatureFields {
  КоличествоTurnover: number;
  СуммаВыручкиTurnover: number;
  СуммаРучнойСкидкиTurnover: number;
  СуммаАвтоматическойСкидкиTurnover: number;
  АналитикаУчетаНоменклатуры: {
    Номенклатура: {
      Description: string;
      Производитель: {
        Description: string;
      };
    };
  };
}

export interface ISalesByPartnersAndNomenclatureFields {
  КоличествоTurnover: number;
  СуммаВыручкиTurnover: number;
  СуммаРучнойСкидкиTurnover: number;
  СуммаАвтоматическойСкидкиTurnover: number;
  АналитикаУчетаНоменклатуры: {
    Номенклатура: {
      Description: string;
      Производитель: {
        Description: string;
      };
    };
  };
  АналитикаУчетаПоПартнерам: {
    Партнер: {
      Description: string;
    };
    Контрагент: string;
  };
}

export interface IUserFields {
  Ref_Key: string;
  DataVersion: string;
  DeletionMark: boolean;
  Description: string;
  Недействителен: boolean;
  ДополнительныеРеквизиты: {
    Свойство_Key: string;
    Значение: string | number;
  }[];
  ФизическоеЛицо: {
    Ref_Key: string;
    DeletionMark: boolean;
    Description: string;
    ДатаРождения: string;
    ИНН: string;
    КонтактнаяИнформация: {
      Тип: string;
      Представление: string;
    }[];
  };
}

export interface IUserAdditionalFields {
  ДополнительныеРеквизиты: {
    LineNumber: string;
    Свойство_Key: string;
    Значение: string;
    Значение_Type: string;
    ТекстоваяСтрока: string;
  }[];
}

export async function getSpecificODataResponseArray({
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
    const fullUrl = `${baseUrl}${path}?${params}`;
    if (process.env.NODE_ENV === "development") {
      console.info(`Fetching OData array response from "${fullUrl}"`);
    }
    // Use fetch to get the response from the OData API
    const response = await fetch(fullUrl, {
      headers: {
        Authorization: authHeader ?? "",
      },
    });
    // Get the JSON response from the OData API
    const odataResponse: ODataResponseArray =
      (await response.json()) as ODataResponseArray;
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

export async function getSpecificODataResponseObject({
  path,
  filter,
  select,
}: {
  path: string;
  filter?: string;
  select?: string;
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
  try {
    const fullUrl = `${baseUrl}${path}?${params}`;
    if (process.env.NODE_ENV === "development") {
      console.info(`Fetching OData object response from "${fullUrl}"`);
    }
    // Use fetch to get the response from the OData API
    const response = await fetch(fullUrl, {
      headers: {
        Authorization: authHeader ?? "",
      },
    });
    // Get the JSON response from the OData API
    const odataResponse: ODataResponseObject =
      (await response.json()) as ODataResponseObject;
    // Check if the response is an error
    if ("odata.error" in odataResponse) {
      throw new Error(odataResponse["odata.error"].message.value);
    }
    return odataResponse;
  } catch (e) {
    console.error("Error while getting OData response", e);
    throw e;
  }
}

export class From1C {
  static async getAllNomenclatureTypes(): Promise<NomenclatureType1CFields[]> {
    return getSpecificODataResponseArray({
      path: "Catalog_ВидыНоменклатуры",
      select:
        "Ref_Key,DeletionMark,Parent_Key,IsFolder,Description,Описание,DataVersion",
      //filter: `DeletionMark eq false`,
      orderBy: "IsFolder desc",
    }) as Promise<NomenclatureType1CFields[]>;
  }

  static async getAllNomenclatureItems(): Promise<Nomenclature1CFields[]> {
    return getSpecificODataResponseArray({
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
    return getSpecificODataResponseArray({
      path: "Catalog_Номенклатура",
      select:
        "Ref_Key,Parent_Key,IsFolder,Code,Description,ЕдиницаИзмерения_Key,Производитель_Key",
      filter: `DeletionMark eq false and ВидНоменклатуры_Key eq guid'${typeId}'`,
    }) as Promise<Nomenclature1CFields[]>;
  }

  static async getNomenclatureItem(
    nId: string,
  ): Promise<Nomenclature1CFields[]> {
    return getSpecificODataResponseArray({
      path: "Catalog_Номенклатура",
      select:
        "Ref_Key,Parent_Key,IsFolder,Code,Description,ЕдиницаИзмерения_Key,Производитель_Key",
      filter: `DeletionMark eq false and Ref_Key eq guid'${nId}'`,
    }) as Promise<Nomenclature1CFields[]>;
  }

  static async getAllNomenclatureFiles(): Promise<IFileFields[]> {
    return getSpecificODataResponseArray({
      path: "Catalog_НоменклатураПрисоединенныеФайлы",
      select: "Ref_Key,ПутьКФайлу,ВладелецФайла_Key",
      filter: `DeletionMark eq false`,
    }) as Promise<IFileFields[]>;
  }

  static async getAllStock(): Promise<IStockFields[]> {
    const guids = await getGlobalSettings();
    const warehouseId = guids.guidsForSync.warehouse;
    return getSpecificODataResponseArray({
      path: "AccumulationRegister_СвободныеОстатки/Balance(Dimensions='Номенклатура,Склад')",
      filter: `Склад_Key eq guid'${warehouseId}'`,
      select:
        "ВНаличииBalance,ВРезервеСоСкладаBalance,ВРезервеПодЗаказBalance,Номенклатура_Key",
    }) as Promise<IStockFields[]>;
  }

  static async getStockForNomenclature(nId: string): Promise<IStockFields[]> {
    const guids = await getGlobalSettings();
    const warehouseId = guids.guidsForSync.warehouse;
    return getSpecificODataResponseArray({
      path: "AccumulationRegister_СвободныеОстатки/Balance",
      filter: `Номенклатура_Key eq guid'${nId}' and Склад_Key eq guid'${warehouseId}'`,
    }) as Promise<IStockFields[]>;
  }

  static async getAllPrices(priceId: string): Promise<IPriceFields[]> {
    return getSpecificODataResponseArray({
      path: "InformationRegister_ЦеныНоменклатуры_RecordType/SliceLast",
      select: "Recorder,Period,Цена,Упаковка_Key,Номенклатура_Key",
      filter: `ВидЦены_Key eq guid'${priceId}'`,
    }) as Promise<IPriceFields[]>;
  }

  static async getPriceForNomenclature(
    nId: string,
    priceId: string,
  ): Promise<IPriceFields[]> {
    return getSpecificODataResponseArray({
      path: "InformationRegister_ЦеныНоменклатуры_RecordType/SliceLast",
      select: "Цена,Period,Упаковка_Key",
      filter: `Номенклатура_Key eq guid'${nId}' and ВидЦены_Key eq guid'${priceId}'`,
    }) as Promise<IPriceFields[]>;
  }

  static async getNomenclatureMeasurementUnits(
    nId: string,
  ): Promise<IUnitFields[]> {
    return getSpecificODataResponseArray({
      path: "Catalog_УпаковкиЕдиницыИзмерения",
      select: "Ref_Key,Description,Вес,Числитель,Знаменатель",
      filter: `Owner eq cast(guid'${nId}', 'Catalog_Номенклатура')`,
    }) as Promise<IUnitFields[]>;
  }

  static async getAllMeasurementUnits(): Promise<IUnitFields[]> {
    return getSpecificODataResponseArray({
      path: "Catalog_УпаковкиЕдиницыИзмерения",
      select:
        "Ref_Key,Description,DeletionMark,DataVersion,Owner,Вес,Числитель,Знаменатель",
    }) as Promise<IUnitFields[]>;
  }

  static async getAllManufacturers(): Promise<Manufacturer1CFields[]> {
    return getSpecificODataResponseArray({
      path: "Catalog_Производители",
      select: "Ref_Key,DataVersion,DeletionMark,IsFolder,Description",
      filter: `IsFolder eq false`,
    }) as Promise<Manufacturer1CFields[]>;
  }

  static async getOrderById(orderId: string): Promise<IOrderFields[]> {
    return getSpecificODataResponseArray({
      path: "Document_ЗаказКлиента",
      select:
        "Ref_Key,Number,Date,СуммаДокумента,Комментарий,Статус,ФормаОплаты,ДатаОтгрузки,АдресДоставки,СпособДоставки,Партнер/Description,DeletionMark",
      filter: `Ref_Key eq guid'${orderId}'`,
      expand: "Партнер",
    }) as Promise<IOrderFields[]>;
  }

  static async getOrdersForUserByDate({
    userId,
    startDate,
    endDate,
  }: {
    userId: string;
    startDate: string;
    endDate: string;
  }): Promise<IOrderFields[]> {
    return getSpecificODataResponseArray({
      path: "Document_ЗаказКлиента",
      select:
        "Ref_Key,Number,Date,СуммаДокумента,Комментарий,Статус,ФормаОплаты,ДатаОтгрузки,АдресДоставки,СпособДоставки,Партнер/Description,DeletionMark",
      filter: `Менеджер_Key eq guid'${userId}' and Date ge datetime'${startDate}T00:00:00' and Date le datetime'${endDate}T23:59:59'`,
      expand: "Партнер",
    }) as Promise<IOrderFields[]>;
  }

  static async getOrdersForUserByDeliveryDate({
    userId,
    startDate,
    endDate,
  }: {
    userId: string;
    startDate: string;
    endDate: string;
  }): Promise<IOrderFields[]> {
    return getSpecificODataResponseArray({
      path: "Document_ЗаказКлиента",
      select:
        "Ref_Key,Number,Date,СуммаДокумента,Статус,ФормаОплаты,ДатаОтгрузки,АдресДоставки,СпособДоставки,Партнер/Description,DeletionMark",
      filter: `Менеджер_Key eq guid'${userId}' and ДатаОтгрузки ge datetime'${startDate}T00:00:00' and ДатаОтгрузки le datetime'${endDate}T23:59:59'`,
      expand: "Партнер",
    }) as Promise<any[]>;
  }

  static async getOrderContent(
    orderId: string,
  ): Promise<IOrderContentFields[]> {
    return getSpecificODataResponseArray({
      path: `Document_ЗаказКлиента_Товары`,
      filter: `Ref_Key eq guid'${orderId}'`,
      expand: `Номенклатура`,
      select: `LineNumber,Номенклатура_Key,Количество,ВидЦены_Key,Цена,Сумма,СуммаНДС,СуммаСНДС,СуммаРучнойСкидки,СуммаАвтоматическойСкидки,Отменено,Номенклатура/Description`,
    }) as Promise<any[]>;
  }

  /**
   *
   * @param managerId - guid
   * @param startDate - has to be a string formatted as "YYYY-MM-DDTHH:MM:SS"
   * @param endDate - has to be a string formatted as "YYYY-MM-DDTHH:MM:SS"
   */
  static async getSalesByManagerGroupedByPartners({
    managerId,
    startDate,
    endDate,
  }: {
    managerId: string;
    startDate: string;
    endDate: string;
  }) {
    return getSpecificODataResponseArray({
      path: `AccumulationRegister_ВыручкаИСебестоимостьПродаж/Turnovers(EndPeriod=datetime'${endDate}',StartPeriod=datetime'${startDate}',Dimensions='Менеджер,АналитикаУчетаПоПартнерам')`,
      select:
        "КоличествоTurnover,СуммаВыручкиTurnover,СуммаРучнойСкидкиTurnover,СуммаАвтоматическойСкидкиTurnover,АналитикаУчетаПоПартнерам/Контрагент,АналитикаУчетаПоПартнерам/Партнер/Description",
      filter: `Менеджер_Key eq guid'${managerId}'`,
      expand: "АналитикаУчетаПоПартнерам/Партнер",
      orderBy: "СуммаВыручкиTurnover desc",
    }) as Promise<ISalesByPartnersFields[]>;
  }

  /**
   *
   * @param managerId - guid
   * @param startDate - has to be a string formatted as "YYYY-MM-DDTHH:MM:SS"
   * @param endDate - has to be a string formatted as "YYYY-MM-DDTHH:MM:SS"
   */
  static async getSalesByManagerGroupedByNomenclature({
    managerId,
    startDate,
    endDate,
  }: {
    managerId: string;
    startDate: string;
    endDate: string;
  }) {
    return getSpecificODataResponseArray({
      path: `AccumulationRegister_ВыручкаИСебестоимостьПродаж/Turnovers(EndPeriod=datetime'${endDate}',StartPeriod=datetime'${startDate}',Dimensions='Менеджер,АналитикаУчетаНоменклатуры')`,
      select:
        "КоличествоTurnover,СуммаВыручкиTurnover,СуммаРучнойСкидкиTurnover,СуммаАвтоматическойСкидкиTurnover,АналитикаУчетаНоменклатуры/Номенклатура/Description,АналитикаУчетаНоменклатуры/Номенклатура/Производитель/Description",
      filter: `Менеджер_Key eq guid'${managerId}'`,
      expand: "АналитикаУчетаНоменклатуры/Номенклатура/Производитель",
      orderBy: "СуммаВыручкиTurnover desc",
    }) as Promise<ISalesByNomenclatureFields[]>;
  }

  /**
   *
   * @param managerId - guid
   * @param startDate - has to be a string formatted as "YYYY-MM-DDTHH:MM:SS"
   * @param endDate - has to be a string formatted as "YYYY-MM-DDTHH:MM:SS"
   */
  static async getSalesByManagerGroupedByPartnerAndNomenclature({
    managerId,
    startDate,
    endDate,
  }: {
    managerId: string;
    startDate: string;
    endDate: string;
  }) {
    return getSpecificODataResponseArray({
      path: `AccumulationRegister_ВыручкаИСебестоимостьПродаж/Turnovers(EndPeriod=datetime'${endDate}',StartPeriod=datetime'${startDate}',Dimensions='Менеджер,АналитикаУчетаПоПартнерам,АналитикаУчетаНоменклатуры'')`,
      select:
        "КоличествоTurnover,СуммаВыручкиTurnover,СуммаРучнойСкидкиTurnover,СуммаАвтоматическойСкидкиTurnover,АналитикаУчетаНоменклатуры/Номенклатура/Description,АналитикаУчетаНоменклатуры/Номенклатура/Производитель/Description,АналитикаУчетаПоПартнерам/Контрагент,АналитикаУчетаПоПартнерам/Партнер/Description",
      filter: `Менеджер_Key eq guid'${managerId}'`,
      expand:
        "АналитикаУчетаПоПартнерам/Партнер,АналитикаУчетаНоменклатуры/Номенклатура/Производитель",
      orderBy: "СуммаВыручкиTurnover desc",
    }) as Promise<ISalesByPartnersAndNomenclatureFields[]>;
  }

  static async getAllUsers(): Promise<IUserFields[]> {
    return getSpecificODataResponseArray({
      path: "Catalog_Пользователи",
      select:
        "Ref_Key,DataVersion,DeletionMark,Description,Недействителен,ДополнительныеРеквизиты/Свойство_Key,ДополнительныеРеквизиты/Значение,ФизическоеЛицо/Ref_Key,ФизическоеЛицо/DeletionMark,ФизическоеЛицо/Description,ФизическоеЛицо/ДатаРождения,ФизическоеЛицо/ИНН,ФизическоеЛицо/КонтактнаяИнформация/Тип,ФизическоеЛицо/КонтактнаяИнформация/Представление",
      expand: "ФизическоеЛицо",
      filter: `Недействителен eq false and DeletionMark eq false`,
    }) as Promise<IUserFields[]>;
  }

  static async getUserByGuid(userId: string): Promise<IUserFields> {
    const res = (await getSpecificODataResponseArray({
      path: "Catalog_Пользователи",
      select:
        "Ref_Key,DataVersion,DeletionMark,Description,Недействителен,ДополнительныеРеквизиты/Свойство_Key,ДополнительныеРеквизиты/Значение,ФизическоеЛицо/Ref_Key,ФизическоеЛицо/DeletionMark,ФизическоеЛицо/Description,ФизическоеЛицо/ДатаРождения,ФизическоеЛицо/ИНН,ФизическоеЛицо/КонтактнаяИнформация/Тип,ФизическоеЛицо/КонтактнаяИнформация/Представление",
      expand: "ФизическоеЛицо",
      filter: `Ref_Key eq guid'${userId}'`,
    })) as IUserFields[];
    return res[0];
  }

  static async patchUserSitePassword({
    userId,
    newPassword,
  }: {
    userId: string;
    newPassword: string;
  }) {
    try {
      const guids = await getGlobalSettings();
      // First, get the fill additional fields for the user, PATCH requires the full object
      const fullFields = (await getSpecificODataResponseObject({
        path: `Catalog_Пользователи(guid'${userId}')`,
        select: "ДополнительныеРеквизиты",
      })) as unknown as IUserAdditionalFields;
      // Find the field with the site password
      const sitePasswordField = fullFields.ДополнительныеРеквизиты.find(
        (f) => f.Свойство_Key === guids.guidsForSync.user.sitePassword,
      );
      // If the field exists, mutate it, otherwise, create it
      if (sitePasswordField) {
        sitePasswordField.Значение = newPassword;
      } else {
        // Determine the correct line number
        const maxLineNumber = Math.max(
          ...fullFields.ДополнительныеРеквизиты.map((f) =>
            parseInt(f.LineNumber),
          ),
        );
        fullFields.ДополнительныеРеквизиты.push({
          LineNumber: (maxLineNumber + 1).toString(),
          Свойство_Key: guids.guidsForSync.user.sitePassword ?? "",
          Значение: newPassword,
          Значение_Type: "Edm.String",
          ТекстоваяСтрока: "",
        });
      }
      // PATCH the user with the new site password
      const patchResponse = await fetch(
        `${env.ODATA_API_URL}Catalog_Пользователи(guid'${userId}')?$format=json`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: env.ODATA_API_AUTH_HEADER ?? "",
          },
          body: JSON.stringify(fullFields),
        },
      );
      // Check if the response returns the new password
      const patchedUser = (await patchResponse.json()) as IUserFields;
      const sitePasswordFieldPatched =
        patchedUser?.ДополнительныеРеквизиты?.find(
          (f) => f.Свойство_Key === guids.guidsForSync.user.sitePassword,
        );
      if (sitePasswordFieldPatched?.Значение === newPassword) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          error: "Error while patching user site password",
        };
      }
    } catch (e) {
      console.error("Error while patching user site password", e);
      return null;
    }
  }
  static async getAllWarehouses(): Promise<
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

  static async getAllPriceTypes(): Promise<
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

  static async getAllAdditionalProperties(): Promise<
    {
      Ref_Key: string;
      DataVersion: string;
      Description: string;
      Имя: string;
      Заголовок: string;
    }[]
  > {
    return getSpecificODataResponseArray({
      path: "ChartOfCharacteristicTypes_ДополнительныеРеквизитыИСведения",
      select: "Ref_Key,DataVersion,Description,Имя,Заголовок",
      filter: `DeletionMark eq false`,
    }) as Promise<
      {
        Ref_Key: string;
        DataVersion: string;
        Description: string;
        Имя: string;
        Заголовок: string;
      }[]
    >;
  }

  static async getMainUnits(): Promise<
    {
      Ref_Key: string;
      DataVersion: string;
      Description: string;
      КодЭСФ: string;
    }[]
  > {
    return getSpecificODataResponseArray({
      path: "Catalog_УпаковкиЕдиницыИзмерения",
      select: "Ref_Key,DataVersion,Description,КодЭСФ",
      filter: `КодЭСФ eq '796' or КодЭСФ eq '166'`,
    }) as Promise<
      {
        Ref_Key: string;
        DataVersion: string;
        Description: string;
        КодЭСФ: string;
      }[]
    >;
  }

  static async getAllPropertyValues(): Promise<
    {
      Ref_Key: string;
      DataVersion: string;
      Description: string;
    }[]
  > {
    return getSpecificODataResponseArray({
      path: "Catalog_ЗначенияСвойствОбъектов",
      select: "Ref_Key,DataVersion,Description",
      filter: `DeletionMark eq false`,
    }) as Promise<
      {
        Ref_Key: string;
        DataVersion: string;
        Description: string;
      }[]
    >;
  }
}
