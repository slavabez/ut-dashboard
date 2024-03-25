import { getGlobalSettings } from "@/actions/site-settings";
import {
  ManufacturerInsert,
  MeasurementUnitInsert,
  NomenclatureInsert,
  NomenclatureTypeInsert,
} from "@/drizzle/schema";
import {
  IPriceFields,
  IStockFields,
  IUnitFields,
  IUserFields,
  Manufacturer1CFields,
  Nomenclature1CFields,
  NomenclatureType1CFields,
} from "@/lib/odata";
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
  static async nomenclatureItem(
    input: Nomenclature1CFields,
  ): Promise<NomenclatureInsert> {
    const guids = await getGlobalSettings();
    const minWeightProperty = input.ДополнительныеРеквизиты.find(
      (req) =>
        req.Свойство_Key ===
        guids.guidsForSync.nomenclature.minimumNonDivisibleWeight,
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

  static async user(input: IUserFields): Promise<IParsedUser> {
    const guids = await getGlobalSettings();
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
}
