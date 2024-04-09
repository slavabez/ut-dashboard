import { getSpecificODataResponseArray } from "@/lib/odata/general";

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

export async function getOrderById(orderId: string): Promise<IOrderFields[]> {
  return getSpecificODataResponseArray({
    path: "Document_ЗаказКлиента",
    select:
      "Ref_Key,Number,Date,СуммаДокумента,Комментарий,Статус,ФормаОплаты,ДатаОтгрузки,АдресДоставки,СпособДоставки,Партнер/Description,DeletionMark",
    filter: `Ref_Key eq guid'${orderId}'`,
    expand: "Партнер",
  }) as Promise<IOrderFields[]>;
}

export async function getOrdersForUserByDate({
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

export async function getOrdersForUserByDeliveryDate({
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

export async function getOrderContent(
  orderId: string,
): Promise<IOrderContentFields[]> {
  return getSpecificODataResponseArray({
    path: `Document_ЗаказКлиента_Товары`,
    filter: `Ref_Key eq guid'${orderId}'`,
    expand: `Номенклатура`,
    select: `LineNumber,Номенклатура_Key,Количество,ВидЦены_Key,Цена,Сумма,СуммаНДС,СуммаСНДС,СуммаРучнойСкидки,СуммаАвтоматическойСкидки,Отменено,Номенклатура/Description`,
  }) as Promise<IOrderContentFields[]>;
}

export interface IOrderAdditionaFields {
  Объект: string;
  Свойство_Key: string;
  Значение: string;
}

export async function getOrderAdditionalProperties(
  orderId: string,
): Promise<IOrderAdditionaFields[]> {
  return getSpecificODataResponseArray({
    path: "InformationRegister_ДополнительныеСведения",
    filter: `Объект eq cast(guid'${orderId}', 'Document_ЗаказКлиента')`,
    select: "Объект,Свойство_Key,Значение",
  }) as Promise<IOrderAdditionaFields[]>;
}

export async function getMultipleOrderAdditionalProperties(
  orderIds: string[],
): Promise<IOrderAdditionaFields[]> {
  const MAX_IDS_REQUEST = 20;
  const results: IOrderAdditionaFields[][] = [];

  // TODO: test this thoroughly

  for (let i = 0; i < orderIds.length; i += MAX_IDS_REQUEST) {
    const chunkIds = orderIds.slice(i, i + MAX_IDS_REQUEST);
    const chunkResult = (await getSpecificODataResponseArray({
      path: "InformationRegister_ДополнительныеСведения",
      filter: chunkIds
        .map((oi) => `Объект eq cast(guid'${oi}', 'Document_ЗаказКлиента')`)
        .join(" or "),
      select: "Объект,Свойство_Key,Значение",
    })) as Promise<IOrderAdditionaFields[]>;
    results.push(await chunkResult);
  }

  // Use Array.prototype.flat() to flatten the array of array of results into a single array of results
  return results.flat();
}
