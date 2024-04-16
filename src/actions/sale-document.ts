import { ConvertFrom1C, ISale } from "@/lib/1c-adapter";
import { currentUser } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import {
  getAllDebtSellingDocuments,
  getAllSellingDocumentsByAgentIdsOnly,
  getSellingDocumentsByIds,
} from "@/lib/odata/debt";
import { getDebtBySaleId, getSaleById, getSaleContent } from "@/lib/odata/sale";

export interface ISaleReportItem {
  id: string;
  number: string;
  date: string;
  amount: number;
  debtAmount?: number;
  counterpartyId: string;
  counterpartyParentId: string;
  counterpartyName: string;
  partnerId: string;
  partnerName: string;
}

export async function getDebtForUser(): Promise<
  IActionResponse<
    {
      counterpartyId: string;
      counterpartyName: string;
      documents: ISaleReportItem[];
      totalDebt: number;
    }[]
  >
> {
  const user = await currentUser();

  if (!user) {
    return { status: "error", error: "Вы не вошли" };
  }
  if (user.role === "client") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }
  if (!user.id) {
    return {
      status: "error",
      error: "Не удалось получить информацию о пользователе",
    };
  }

  try {
    const [allDebt, allUserDocs] = await Promise.all([
      getAllDebtSellingDocuments(),
      getAllSellingDocumentsByAgentIdsOnly(user.id),
    ]);

    const userDocKeys = new Set(allUserDocs.map((doc) => doc.Ref_Key));
    const userDebts = allDebt.filter((debt) =>
      userDocKeys.has(debt.ЗаказКлиента),
    );

    const sellingDocuments = await getSellingDocumentsByIds(
      userDebts.map((debt) => debt.ЗаказКлиента),
    );

    const docsWithDebt = sellingDocuments.map((doc) => ({
      id: doc.Ref_Key,
      number: doc.Number,
      date: doc.Date,
      amount: doc.СуммаДокумента,
      debtAmount:
        userDebts.find((debt) => debt.ЗаказКлиента === doc.Ref_Key)
          ?.ДолгBalance || 0,
      counterpartyId: doc.Контрагент.Ref_Key,
      counterpartyParentId: doc.Контрагент.ГоловнойКонтрагент_Key,
      counterpartyName: doc.Контрагент.Description,
      partnerId: doc.Партнер.Ref_Key,
      partnerName: doc.Партнер.Description,
    }));

    const groupedByCounterparty = docsWithDebt.reduce((acc, doc) => {
      if (!acc.has(doc.counterpartyId)) {
        acc.set(doc.counterpartyId, {
          counterpartyId: doc.counterpartyId,
          counterpartyName: doc.counterpartyName,
          documents: [],
          totalDebt: 0,
        });
      }
      const group = acc.get(doc.counterpartyId);
      group.documents.push(doc);
      group.totalDebt += doc.debtAmount;
      return acc;
    }, new Map());

    const sortedAndGrouped = Array.from(groupedByCounterparty.values())
      .map((group) => {
        group.documents.sort(
          (a: ISaleReportItem, b: ISaleReportItem) =>
            (b.debtAmount ?? 0) - (a.debtAmount ?? 0),
        );
        return group;
      })
      .sort((a, b) => b.totalDebt - a.totalDebt); // Sort groups by totalDebt

    return { status: "success", data: sortedAndGrouped };
  } catch (error) {
    console.error("Error in getDebtByUser:", error);
    return { status: "error", error: "Ошибка при подсчете долгов" };
  }
}

export async function getSaleDocumentDetails(
  saleId: string,
): Promise<IActionResponse<ISale>> {
  const user = await currentUser();
  if (!user) {
    return {
      status: "error",
      error: "Вы не вошли",
    };
  }
  if (user.role === "client") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }
  if (!user.id) {
    return {
      status: "error",
      error: "Не удалось получить информацию о пользователе",
    };
  }

  try {
    const saleDetails = await getSaleById(saleId);
    if (saleDetails.length === 0) {
      return {
        status: "error",
        error: "Документ не найден",
      };
    }
    const saleContent = await getSaleContent(saleId);
    const saleDebt = await getDebtBySaleId(saleId);

    return {
      status: "success",
      data: ConvertFrom1C.sale(saleDetails[0], saleContent, saleDebt),
    };
  } catch (e) {
    console.error("Error in getSaleDocumentDetails:", e);
    return {
      status: "error",
      error: "Ошибка при получении информации о документе",
    };
  }
}
