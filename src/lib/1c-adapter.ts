import "@/actions/site-settings";
import {
  ManufacturerInsert,
  MeasurementUnitInsert,
  NomenclatureInsert,
  NomenclatureTypeInsert,
} from "@/drizzle/schema";
import {
  IUnitFields,
  Manufacturer1CFields,
  Nomenclature1CFields,
  NomenclatureType1CFields,
} from "@/lib/odata/nomenclature";
import { IOrderContentFields, IOrderFields } from "@/lib/odata/orders";
import { IPriceFields } from "@/lib/odata/prices";
import { ISaleContentFields, ISaleFields } from "@/lib/odata/sale";
import { IStockFields } from "@/lib/odata/stock";
import { IUserFields } from "@/lib/odata/users";
import { ISiteSettingsStrict } from "@/lib/site-settings";
import { normalizePhoneNumber, parseBoolean } from "@/lib/utils";

export interface IParsedUser {
  id: string;
  showOnSite: boolean;
  isDeleted: boolean;
  name: string;
  inactive: boolean;
  realId: string | null;
  realName: string | null;
  iin: string | null;
  phone: string | null;
  email: string | null;
  sitePassword: string | null;
  siteRole: string | null;
}

export interface IOrderItem {
  line: number;
  nomenclatureId: string;
  quantity: number;
  priceId: string;
  price: number;
  sum: number;
  vat: number;
  totalSum: number;
  autoDiscount: number;
  manualDiscount: number;
  cancelled: boolean;
  nomenclatureName: string;
}

export interface IOrder {
  id: string;
  number: string;
  date: Date;
  sum: number;
  status: string;
  paymentType: string;
  deliveryDate: string;
  deliveryAddress: string;
  deliveryType: string;
  deletionMark: boolean;
  partner: string;
  comment: string;
  items: IOrderItem[];
  additionalProperties?: IOrderAdditionalProperties;
}

export interface IOrderAdditionalProperties {
  lon?: number;
  lat?: number;
  started?: Date;
  finished?: Date;
}

export interface ISaleItem {
  line: number;
  nomenclatureId: string;
  quantity: number;
  priceId: string;
  price: number;
  sum: number;
  vat: number;
  totalSum: number;
  autoDiscount: number;
  manualDiscount: number;
  nomenclatureName: string;
}

export interface ISale {
  id: string;
  number: string;
  date: Date;
  posted: boolean;
  sum: number;
  paymentType: string;
  deliveryAddress: string;
  deliveryType: string;
  partner: string;
  comment: string;
  debt?: number;
  orderId?: string;
  items: ISaleItem[];
}

const assignProperId = (id: string | number) => {
  if (typeof id !== "string") {
    return null;
  }
  if (id === "00000000-0000-0000-0000-000000000000") {
    return null;
  }
  return id;
};

export class ConvertFrom1C {
  static nomenclatureItem(
    input: Nomenclature1CFields,
    siteSettings: ISiteSettingsStrict,
  ): NomenclatureInsert {
    const { guidsForSync } = siteSettings;
    const minWeightProperty = input.ДополнительныеРеквизиты.find(
      (req) =>
        req.Свойство_Key ===
        guidsForSync.nomenclature.minimumNonDivisibleWeight,
    );
    let minimumWeight = 0;
    if (minWeightProperty) {
      minimumWeight = parseFloat(minWeightProperty.Значение as string);
    }
    const hideOnSiteProperty = input.ДополнительныеРеквизиты.find(
      (req) => req.Свойство_Key === guidsForSync.nomenclature.hideOnSite,
    );
    let showOnSite = true;
    if (hideOnSiteProperty) {
      showOnSite = !parseBoolean(hideOnSiteProperty.Значение);
    }
    return {
      id: input.Ref_Key,
      name: input.Description,
      description: input.Описание ?? null,
      isWeightGoods: input.ВесИспользовать,
      code: input.Code,
      dataVersion: input.DataVersion,
      parentId: assignProperId(input.Parent_Key),
      deletionMark: input.DeletionMark,
      baseUnitId: input.ЕдиницаИзмерения_Key ?? null,
      typeId: assignProperId(input.ВидНоменклатуры_Key),
      manufacturerId: assignProperId(input.Производитель_Key ?? 0),
      isFolder: input.IsFolder,
      showOnSite,
      minimumWeight,
    };
  }

  static nomenclatureType(
    input: NomenclatureType1CFields,
  ): NomenclatureTypeInsert {
    return {
      dataVersion: input.DataVersion,
      deletionMark: input.DeletionMark,
      description: input.Описание,
      id: input.Ref_Key,
      name: input.Description,
      parentId: assignProperId(input.Parent_Key),
      isFolder: input.IsFolder,
    };
  }

  static manufacturer(input: Manufacturer1CFields): ManufacturerInsert {
    return {
      dataVersion: input.DataVersion,
      deletionMark: input.DeletionMark,
      id: input.Ref_Key,
      name: input.Description,
    };
  }

  static price(input: IPriceFields) {
    return {
      price: input.Цена * 100,
      period: new Date(input.Period),
      nomenclatureId: input.Номенклатура_Key,
      measurementUnit: assignProperId(input.Упаковка_Key),
    };
  }

  static stock(input: IStockFields) {
    return {
      nomenclatureId: input.Номенклатура_Key,
      stock:
        input.ВНаличииBalance -
        input.ВРезервеПодЗаказBalance -
        input.ВРезервеСоСкладаBalance,
      stockDate: new Date(),
    };
  }

  static measurementUnit(input: IUnitFields): MeasurementUnitInsert {
    return {
      id: input.Ref_Key,
      name: input.Description,
      weight: input.Вес,
      numerator: input.Числитель,
      nomenclatureId: input.Owner,
      deletionMark: input.DeletionMark,
      dataVersion: input.DataVersion,
      denominator: input.Знаменатель,
    };
  }

  static user(input: IUserFields, guids: ISiteSettingsStrict): IParsedUser {
    const phone = input.ФизическоеЛицо?.КонтактнаяИнформация.find(
      (c) => c.Тип === "Телефон",
    )?.Представление;
    const email = input.ФизическоеЛицо?.КонтактнаяИнформация.find(
      (c) => c.Тип === "АдресЭлектроннойПочты",
    )?.Представление;
    const showOnSite =
      input.ДополнительныеРеквизиты.find(
        (req) => req.Свойство_Key === guids.guidsForSync.user.showOnSite,
      )?.Значение ?? false;
    const sitePassword = input.ДополнительныеРеквизиты.find(
      (req) => req.Свойство_Key === guids.guidsForSync.user.sitePassword,
    )?.Значение;
    const siteRoleValue = input.ДополнительныеРеквизиты.find(
      (req) => req.Свойство_Key === guids.guidsForSync.user.siteRole,
    )?.Значение;
    let siteRole;
    switch (siteRoleValue) {
      case guids.guidsForSync.user.siteRoleEmployeeValue:
        siteRole = "employee";
        break;
      case guids.guidsForSync.user.siteRoleAdminValue:
        siteRole = "admin";
        break;
      case guids.guidsForSync.user.siteRoleManagerValue:
        siteRole = "manager";
        break;
      default:
        siteRole = null;
        break;
    }

    return {
      id: input.Ref_Key,
      showOnSite: parseBoolean(showOnSite),
      isDeleted: input.DeletionMark,
      name: input.Description,
      inactive: parseBoolean(input.Недействителен),
      realId: input?.ФизическоеЛицо?.Ref_Key ?? null,
      realName: input?.ФизическоеЛицо?.Description ?? "Не указано",
      iin: input?.ФизическоеЛицо?.ИНН ?? "Не указано",
      phone: normalizePhoneNumber(phone) ?? null,
      email: email ?? null,
      sitePassword: sitePassword?.toString() ?? null,
      siteRole,
    };
  }

  static order(input: IOrderFields): IOrder {
    return {
      id: input.Ref_Key,
      number: input.Number,
      date: new Date(input.Date),
      sum: input.СуммаДокумента,
      status: input.Статус,
      paymentType: input.ФормаОплаты,
      deliveryDate: input.ДатаОтгрузки,
      deliveryAddress: input.АдресДоставки,
      deliveryType: input.СпособДоставки,
      deletionMark: input.DeletionMark,
      partner: input?.Партнер?.Description ?? "Партнер не найден",
      comment: input.Комментарий,
      items: [],
    };
  }

  static orderItem(input: IOrderContentFields): IOrderItem {
    return {
      line: input.LineNumber,
      nomenclatureId: input.Номенклатура_Key,
      quantity: input.Количество,
      priceId: input.Цена_Key,
      price: input.Цена,
      sum: input.Сумма,
      vat: input.СуммаНДС,
      totalSum: input.СуммаСНДС,
      autoDiscount: input.СуммаАвтоматическойСкидки,
      manualDiscount: input.СуммаРучнойСкидки,
      cancelled: input.Отменено,
      nomenclatureName: input.Номенклатура.Description,
    };
  }

  static injectAdditionalPropertiesIntoOrders(
    orders: IOrder[],
    siteSettings: ISiteSettingsStrict,
    data: {
      Объект: string;
      Свойство_Key: string;
      Значение: string;
    }[],
  ) {
    data.forEach((di) => {
      if (!di.Значение) return;
      const order = orders.find((o) => o.id === di?.Объект);
      if (!order) return;
      if (!order.additionalProperties) order.additionalProperties = {};
      switch (di.Свойство_Key) {
        case siteSettings.guidsForSync.orders.latitude:
          order.additionalProperties.lat = convertCoordinate(di.Значение);
          break;
        case siteSettings.guidsForSync.orders.longitude:
          order.additionalProperties.lon = convertCoordinate(di.Значение);
          break;
        case siteSettings.guidsForSync.orders.timeStarted:
          order.additionalProperties.started = new Date(di.Значение);
          break;
        case siteSettings.guidsForSync.orders.timeStopped:
          order.additionalProperties.finished = new Date(di.Значение);
          break;
        default:
      }
    });

    return orders;
  }

  static sale(
    input: ISaleFields,
    items?: ISaleContentFields[],
    saleDebt?: number,
  ): ISale {
    return {
      id: input.Ref_Key,
      number: input.Number,
      date: new Date(input.Date),
      sum: input.СуммаДокумента,
      comment: input.Комментарий,
      posted: input.Posted,
      deliveryAddress: input.АдресДоставки,
      deliveryType: input.СпособДоставки,
      partner: input.Партнер.Description,
      paymentType: input.ФормаОплаты,
      debt: saleDebt ? saleDebt : 0,
      orderId: input.ЗаказКлиента,
      items: Array.isArray(items)
        ? items.map((i: ISaleContentFields) => ({
            line: i.LineNumber,
            nomenclatureId: i.Номенклатура_Key,
            quantity: i.Количество,
            priceId: i.Цена_Key,
            price: i.Цена,
            sum: i.Сумма,
            vat: i.СуммаНДС,
            totalSum: i.СуммаСНДС,
            autoDiscount: i.СуммаАвтоматическойСкидки,
            manualDiscount: i.СуммаРучнойСкидки,
            nomenclatureName: i.Номенклатура.Description,
          }))
        : [],
    };
  }
}

function convertCoordinate(input: string): number {
  const numeric = Number.parseFloat(input);
  const degrees = Math.floor(numeric / 100);
  const minutes = numeric % 100;
  return degrees + minutes / 60;
}
