import { env } from "@/env";
import {
  getSpecificODataResponseArray,
  getSpecificODataResponseObject,
} from "@/lib/odata/general";
import { getLatestSiteSettings } from "@/lib/site-settings";

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

export async function getAllUsers(): Promise<IUserFields[]> {
  return getSpecificODataResponseArray({
    path: "Catalog_Пользователи",
    select:
      "Ref_Key,DataVersion,DeletionMark,Description,Недействителен,ДополнительныеРеквизиты/Свойство_Key,ДополнительныеРеквизиты/Значение,ФизическоеЛицо/Ref_Key,ФизическоеЛицо/DeletionMark,ФизическоеЛицо/Description,ФизическоеЛицо/ДатаРождения,ФизическоеЛицо/ИНН,ФизическоеЛицо/КонтактнаяИнформация/Тип,ФизическоеЛицо/КонтактнаяИнформация/Представление",
    expand: "ФизическоеЛицо",
    filter: `Недействителен eq false and DeletionMark eq false`,
  }) as Promise<IUserFields[]>;
}

export async function getUserByGuid(userId: string): Promise<IUserFields> {
  const res = (await getSpecificODataResponseArray({
    path: "Catalog_Пользователи",
    select:
      "Ref_Key,DataVersion,DeletionMark,Description,Недействителен,ДополнительныеРеквизиты/Свойство_Key,ДополнительныеРеквизиты/Значение,ФизическоеЛицо/Ref_Key,ФизическоеЛицо/DeletionMark,ФизическоеЛицо/Description,ФизическоеЛицо/ДатаРождения,ФизическоеЛицо/ИНН,ФизическоеЛицо/КонтактнаяИнформация/Тип,ФизическоеЛицо/КонтактнаяИнформация/Представление",
    expand: "ФизическоеЛицо",
    filter: `Ref_Key eq guid'${userId}'`,
  })) as IUserFields[];
  return res[0];
}

export async function patchUserSitePassword({
  userId,
  newPassword,
}: {
  userId: string;
  newPassword: string;
}) {
  try {
    const guids = await getLatestSiteSettings();
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
    const sitePasswordFieldPatched = patchedUser?.ДополнительныеРеквизиты?.find(
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
