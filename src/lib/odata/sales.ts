import { getSpecificODataResponseArray } from "@/lib/odata/general";

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

/**
 *
 * @param managerId - guid
 * @param startDate - has to be a string formatted as "YYYY-MM-DDTHH:MM:SS"
 * @param endDate - has to be a string formatted as "YYYY-MM-DDTHH:MM:SS"
 */
export async function getSalesByManagerGroupedByPartners({
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
export async function getSalesByManagerGroupedByNomenclature({
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
export async function getSalesByManagerGroupedByPartnerAndNomenclature({
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
