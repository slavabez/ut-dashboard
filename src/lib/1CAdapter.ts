import {
  ManufacturerInsert,
  MeasurementUnitInsert,
  NomenclatureInsert,
  NomenclatureTypeInsert,
} from "@/drizzle/schema";
import { env } from "@/env.mjs";
import {
  IPriceFields,
  IStockFields,
  IUnitFields,
  IUserFields,
  Manufacturer1CFields,
  Nomenclature1CFields,
  NomenclatureType1CFields,
} from "@/lib/odata";
import { normalizePhoneNumber } from "@/lib/utils";

const minWeightPropertyKey = env.MINIMUM_WEIGHT_PARAM_UUID;

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
  static nomenclatureItem(input: Nomenclature1CFields): NomenclatureInsert {
    const minWeightProperty = input.ДополнительныеРеквизиты.find(
      (req) => req.Свойство_Key === minWeightPropertyKey,
    );
    let minimumWeight = 0;
    if (minWeightProperty) {
      minimumWeight = parseFloat(minWeightProperty.Значение as string);
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
      price: input.Цена,
      period: new Date(input.Period),
      nomenclatureId: input.Номенклатура_Key,
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

  static user(input: IUserFields) {
    const phone = input.ФизическоеЛицо?.КонтактнаяИнформация.find(
      (c) => c.Тип === "Телефон",
    )?.Представление;
    const email = input.ФизическоеЛицо?.КонтактнаяИнформация.find(
      (c) => c.Тип === "АдресЭлектроннойПочты",
    )?.Представление;
    const showOnSite =
      input.ДополнительныеРеквизиты.find(
        (req) => req.Свойство_Key === env.SHOW_USER_ON_WEBSITE_PARAM_UUID,
      )?.Значение ?? false;
    const sitePassword = input.ДополнительныеРеквизиты.find(
      (req) => req.Свойство_Key === env.SITE_PASSWORD_PARAM_UUID,
    )?.Значение;
    const siteRoleValue = input.ДополнительныеРеквизиты.find(
      (req) => req.Свойство_Key === env.SITE_ROLE_PARAM_UUID,
    )?.Значение;
    let siteRole = null;
    switch (siteRoleValue) {
      case env.SITE_ROLE_USER_UUID:
        siteRole = "user";
        break;
      case env.SITE_ROLE_ADMIN_UUID:
        siteRole = "admin";
        break;
      default:
        break;
    }

    return {
      id: input.Ref_Key,
      showOnSite,
      isDeleted: input.DeletionMark,
      name: input.Description,
      inactive: input.Недействителен,
      realId: input?.ФизическоеЛицо?.Ref_Key ?? null,
      realName: input?.ФизическоеЛицо?.Description ?? "Не указано",
      iin: input?.ФизическоеЛицо?.ИНН ?? "Не указано",
      phone: normalizePhoneNumber(phone) ?? null,
      email: email ?? null,
      sitePassword: sitePassword ?? null,
      siteRole,
    };
  }
}
