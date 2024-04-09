import React, { useTransition } from "react";

import { deletePriceFromDb } from "@/actions/site-settings";
import { syncPrice } from "@/actions/sync/prices";
import { Button } from "@/components/ui/button";

interface ISyncAndDeleteButtonsProps {
  priceId: string;
  setSuccess: (message: string | undefined) => void;
  setError: (message: string | undefined) => void;
}

const SyncAndDeleteButtons = ({
  priceId,
  setSuccess,
  setError,
}: ISyncAndDeleteButtonsProps) => {
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <Button
        disabled={isPending}
        onClick={() => {
          startTransition(() => {
            syncPrice({ priceId }).then((res) => {
              if (res.status === "success") {
                setSuccess("Цена успешно синхронизирована");
                setError(undefined);
              } else {
                setError("Ошибка синхронизации цены");
                console.error(res.error);
                setSuccess(undefined);
              }
            });
          });
        }}
      >
        Синхронизовать
      </Button>
      <Button
        variant="destructive"
        disabled={isPending}
        onClick={() => {
          startTransition(() => {
            deletePriceFromDb(priceId).then((res) => {
              if (res.status === "success") {
                setSuccess("Цена успешно удалена");
                setError(undefined);
              } else {
                setError("Ошибка удаления цены");
                console.error(res.error);
                setSuccess(undefined);
              }
            });
          });
        }}
      >
        Удалить
      </Button>
    </>
  );
};

export default SyncAndDeleteButtons;
