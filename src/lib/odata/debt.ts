import { getSpecificODataResponseArray } from "@/lib/odata/general";

export async function getAllSellingDocumentsByAgentIdsOnly(
  agentId: string,
): Promise<
  {
    Ref_Key: string;
  }[]
> {
  return getSpecificODataResponseArray({
    path: "Document_РеализацияТоваровУслуг",
    filter: `Менеджер_Key eq guid'${agentId}' and Posted eq true`,
    select: "Ref_Key",
    cacheExpiration: 10 * 60,
  });
}

export async function getAllDebtSellingDocuments(): Promise<
  {
    ДолгBalance: number;
    ЗаказКлиента: string;
  }[]
> {
  return getSpecificODataResponseArray({
    path: "AccumulationRegister_РасчетыСКлиентамиПоДокументам/Balance(Dimensions='ЗаказКлиента')",
    filter: `ЗаказКлиента_Type eq 'StandardODATA.Document_РеализацияТоваровУслуг'`,
    select: "ДолгBalance,ЗаказКлиента",
    cacheExpiration: 30 * 60,
  });
}

export async function getSellingDocumentsByIds(ids: string[]): Promise<
  {
    Ref_Key: string;
    Date: string;
    Number: string;
    СуммаДокумента: number;
    Контрагент: {
      Ref_Key: string;
      Description: string;
      ГоловнойКонтрагент_Key: string;
    };
    Партнер: {
      Ref_Key: string;
      Description: string;
    };
  }[]
> {
  const chunkArray = (arr: string[], size: number): string[][] =>
    arr.length > size
      ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
      : [arr];

  const idChunks = chunkArray(ids, 20);

  const fetchDocumentsForChunk = async (chunk: string[]) =>
    getSpecificODataResponseArray({
      path: "Document_РеализацияТоваровУслуг",
      filter: `${chunk.map((id) => `Ref_Key eq guid'${id}'`).join(" or ")}`,
      select:
        "Ref_Key,Number,Date,СуммаДокумента,Контрагент/Ref_Key,Контрагент/Description,Контрагент/ГоловнойКонтрагент_Key,Партнер/Ref_Key,Партнер/Description",
      expand: "Контрагент,Партнер",
      cacheExpiration: 10 * 60,
    });

  const documents = await Promise.all(idChunks.map(fetchDocumentsForChunk));
  return documents.flat(); // Flatten the array of arrays into a single array
}
