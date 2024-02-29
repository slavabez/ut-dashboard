import {
  ManufacturerInsert,
  NomenclatureInsert,
  NomenclatureTypeInsert,
} from "@/drizzle/schema";
import { env } from "@/env.mjs";
import {
  Manufacturer1CFields,
  Nomenclature1CFields,
  NomenclatureType1CFields,
} from "@/lib/odata";

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
}
