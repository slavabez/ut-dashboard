"use server";

import { currentUser } from "@/lib/auth";
import { From1C } from "@/lib/odata";

export interface IFormattedNomenclatureReportItem {
  quantity: number;
  sum: number;
  discount: number;
  nomenclature: string;
  manufacturer: string;
}

export interface IGroupedNomenclatureReportItem {
  manufacturer: string;
  items: IFormattedNomenclatureReportItem[];
  totals: {
    quantity: number;
    sum: number;
    discount: number;
  };
}

export interface IFormattedPartnerReportItem {
  quantity: number;
  sum: number;
  discount: number;
  partner: string;
  counterpartyId: string;
}

export interface IFormattedPartnerAndNomenclatureReportItem {
  quantity: number;
  sum: number;
  discount: number;
  partner: string;
  counterpartyId: string;
  nomenclature: string;
  manufacturer: string;
}

export interface IGroupedPartnerReportItem {
  partner: string;
  items: IFormattedPartnerReportItem[];
  totals: {
    quantity: number;
    sum: number;
    discount: number;
  };
}

export async function getSalesByGoods({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
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

  if (!startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return {
      status: "error",
      error: "Неверный формат даты начала",
    };
  }

  if (!endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return {
      status: "error",
      error: "Неверный формат даты окончания",
    };
  }

  const sales = await From1C.getSalesByManagerGroupedByNomenclature({
    managerId: user.id,
    startDate: `${startDate}T00:00:00`,
    endDate: `${endDate}T23:59:59`,
  });

  const formatted: IFormattedNomenclatureReportItem[] = sales.map((item) => ({
    sum: item.СуммаВыручкиTurnover,
    quantity: item.КоличествоTurnover,
    discount:
      item.СуммаАвтоматическойСкидкиTurnover + item.СуммаРучнойСкидкиTurnover,
    manufacturer:
      item.АналитикаУчетаНоменклатуры.Номенклатура.Производитель.Description,
    nomenclature: item.АналитикаУчетаНоменклатуры.Номенклатура.Description,
  }));

  const groupedByManufacturer: IGroupedNomenclatureReportItem[] = formatted
    .reduce<IGroupedNomenclatureReportItem[]>((acc, currentItem) => {
      const existingManufacturer = acc.find(
        (item) => item.manufacturer === currentItem.manufacturer,
      );

      if (existingManufacturer) {
        existingManufacturer.items.push(currentItem);
        existingManufacturer.totals.quantity += currentItem.quantity;
        existingManufacturer.totals.sum += currentItem.sum;
        existingManufacturer.totals.discount += currentItem.discount;
      } else {
        acc.push({
          manufacturer: currentItem.manufacturer,
          items: [currentItem],
          totals: {
            quantity: currentItem.quantity,
            sum: currentItem.sum,
            discount: currentItem.discount,
          },
        });
      }

      return acc;
    }, [])
    .sort((a, b) => b.totals.sum - a.totals.sum);

  return {
    status: "success",
    data: groupedByManufacturer,
  };
}

export async function getSalesByClients({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
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

  if (!startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return {
      status: "error",
      error: "Неверный формат даты начала",
    };
  }

  if (!endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return {
      status: "error",
      error: "Неверный формат даты окончания",
    };
  }

  const sales = await From1C.getSalesByManagerGroupedByPartners({
    managerId: user.id,
    startDate: `${startDate}T00:00:00`,
    endDate: `${endDate}T23:59:59`,
  });

  const formatted: IFormattedPartnerReportItem[] = sales.map((item) => ({
    sum: item.СуммаВыручкиTurnover,
    quantity: item.КоличествоTurnover,
    discount:
      item.СуммаАвтоматическойСкидкиTurnover + item.СуммаРучнойСкидкиTurnover,
    partner: item.АналитикаУчетаПоПартнерам.Партнер.Description,
    counterpartyId: item.АналитикаУчетаПоПартнерам.Контрагент,
  }));

  return {
    status: "success",
    data: formatted,
  };
}

export async function getSalesByClientsAndGoods({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
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

  if (!startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return {
      status: "error",
      error: "Неверный формат даты начала",
    };
  }

  if (!endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return {
      status: "error",
      error: "Неверный формат даты окончания",
    };
  }

  const sales = await From1C.getSalesByManagerGroupedByPartnerAndNomenclature({
    managerId: user.id,
    startDate: `${startDate}T00:00:00`,
    endDate: `${endDate}T23:59:59`,
  });

  const formatted: IFormattedPartnerAndNomenclatureReportItem[] = sales.map(
    (item) => ({
      sum: item.СуммаВыручкиTurnover,
      quantity: item.КоличествоTurnover,
      discount:
        item.СуммаАвтоматическойСкидкиTurnover + item.СуммаРучнойСкидкиTurnover,
      partner: item.АналитикаУчетаПоПартнерам.Партнер.Description,
      counterpartyId: item.АналитикаУчетаПоПартнерам.Контрагент,
      nomenclature: item.АналитикаУчетаНоменклатуры.Номенклатура.Description,
      manufacturer:
        item.АналитикаУчетаНоменклатуры.Номенклатура.Производитель.Description,
    }),
  );

  const grouped = formatted.reduce(
    (acc, item) => {
      // If the partner key doesn't exist, initialize it
      if (!acc[item.partner]) {
        acc[item.partner] = {};
      }

      // If the manufacturer key doesn't exist within the partner, initialize it
      if (!acc[item.partner][item.manufacturer]) {
        acc[item.partner][item.manufacturer] = [];
      }

      // Add the item to the correct manufacturer array, under the correct partner
      acc[item.partner][item.manufacturer].push(item);

      return acc;
    },
    {} as Record<
      string,
      Record<string, IFormattedPartnerAndNomenclatureReportItem[]>
    >,
  );

  return {
    status: "success",
    data: grouped,
  };
}
