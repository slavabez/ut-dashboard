"use client";

import React, { useState, useTransition } from "react";

import { syncAllAction } from "@/actions/sync/common";
import { syncManufacturersAction } from "@/actions/sync/manufacturers";
import { syncMeasurementUnitsAction } from "@/actions/sync/measurement-units";
import { syncNomenclatureAction } from "@/actions/sync/nomenclature";
import { syncNomenclatureTypesAction } from "@/actions/sync/nomenclature-types";
import { syncAllPricesAction } from "@/actions/sync/prices";
import { syncStockAction } from "@/actions/sync/stock";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { IActionResponse, ISyncLogMeta, SyncType } from "@/lib/common-types";

export type SyncFormType = SyncType | "all";

interface SyncFormProps {
  syncType: SyncFormType;
  skeleton?: boolean;
}

const SyncForm = ({ syncType, skeleton }: SyncFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  let formTitle;
  let action: () => Promise<IActionResponse<any>>;
  let buttonText = `Синхронизировать `;
  switch (syncType) {
    case "manufacturers":
      formTitle = "Синхронизация производителей";
      action = syncManufacturersAction;
      buttonText += "производителей";
      break;
    case "measurement-units":
      formTitle = "Синхронизация единиц измерения";
      action = syncMeasurementUnitsAction;
      buttonText += "единицы измерения";
      break;
    case "nomenclature":
      formTitle = "Синхронизация номенклатуры";
      action = syncNomenclatureAction;
      buttonText += "номенклатуру";
      break;
    case "nomenclature-types":
      formTitle = "Синхронизация видов номенклатуры";
      action = syncNomenclatureTypesAction;
      buttonText += "виды номенклатуры";
      break;
    case "stock":
      formTitle = "Синхронизация остатков";
      action = syncStockAction;
      buttonText += "остатки";
      break;
    case "prices":
      formTitle = "Синхронизация всех цен";
      action = syncAllPricesAction;
      buttonText += "все цены";
      break;
    case "all":
    default:
      formTitle = "Синхронизация всех данных";
      action = syncAllAction;
      buttonText += "все данные";
      break;
  }

  if (skeleton) {
    return (
      <div className="my-2 flex flex-col items-center justify-center gap-4 p-2">
        <h2 className="text-center text-xl">{formTitle}</h2>
        <Button disabled={true} type="button">
          {buttonText}
        </Button>
      </div>
    );
  }

  const handleClick = () => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const result = await action();
      if (result.status === "success") {
        const meta: ISyncLogMeta = {
          entitiesCreated: 0,
          entitiesFrom1C: 0,
          entitiesIgnored: 0,
          entitiesMarkedDeleted: 0,
          entitiesUpdated: 0,
        };
        if (Array.isArray(result.data)) {
          for (const syncMeta of result.data) {
            meta.entitiesCreated += syncMeta.metadata.entitiesCreated;
            meta.entitiesFrom1C += syncMeta.metadata.entitiesFrom1C;
            meta.entitiesIgnored += syncMeta.metadata.entitiesIgnored;
            meta.entitiesMarkedDeleted +=
              syncMeta.metadata.entitiesMarkedDeleted;
            meta.entitiesUpdated += syncMeta.metadata.entitiesUpdated;
          }
        } else if (typeof result.data === "object") {
          const syncMeta = result.data.metadata as ISyncLogMeta;
          if (syncMeta) {
            meta.entitiesCreated = syncMeta.entitiesCreated;
            meta.entitiesFrom1C = syncMeta.entitiesFrom1C;
            meta.entitiesIgnored = syncMeta.entitiesIgnored;
            meta.entitiesMarkedDeleted = syncMeta.entitiesMarkedDeleted;
            meta.entitiesUpdated = syncMeta.entitiesUpdated;
          }
        }

        setSuccess(
          `Данные успешно синхронизированы. Всего объектов из 1С: ${meta.entitiesFrom1C}. 
          Создано: ${meta.entitiesCreated}, обновлено: ${meta.entitiesUpdated}, 
          пометок удаления поставлено или снято: ${meta.entitiesMarkedDeleted}, 
          пропущено: ${meta.entitiesIgnored}`,
        );
      } else {
        setError(result.error ?? "Ошибка при синхронизации");
      }
    });
  };

  return (
    <div className="my-2 flex flex-col items-center justify-center gap-4 p-2">
      <h2 className="text-center text-xl">{formTitle}</h2>
      <Button
        onClick={handleClick}
        disabled={isPending}
        type="button"
        className="capitalize"
      >
        {buttonText} {isPending && "..."}
      </Button>
      {error && <FormError message={error} />}
      {success && <FormSuccess message={success} />}
    </div>
  );
};

export default SyncForm;
