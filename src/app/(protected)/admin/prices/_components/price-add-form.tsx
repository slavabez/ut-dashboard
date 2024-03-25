"use client";

import React, { useState, useTransition } from "react";

import { addNewPriceToDb, deletePriceFromDb } from "@/actions/site-settings";
import { syncPrice } from "@/actions/sync/prices";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PriceInsert } from "@/drizzle/schema";
import { formatRelativeDate } from "@/lib/utils";

interface IPriceAddFormProps {
  pricesInDb: any[];
  pricesFrom1C: any[];
}

const PriceAddForm = (props: IPriceAddFormProps) => {
  const { pricesFrom1C, pricesInDb } = props;
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const pricesToShow = pricesFrom1C.filter((pt) => {
    return !pricesInDb.some((price) => price.priceId === pt.Ref_Key);
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => {
      const priceId = e.currentTarget.priceId.value;
      const price = pricesFrom1C.find((pt) => pt.Ref_Key === priceId);
      if (!price) {
        return;
      }
      const newPrice: PriceInsert = {
        id: priceId,
        name: price.Description,
        code: price.Идентификатор,
        currency: price.ВалютаЦены.Description,
      };
      addNewPriceToDb(newPrice).then((res) => {
        if (res.status === "success") {
          setSuccess("Цена успешно добавлена");
          setError(undefined);
        } else {
          setError("Ошибка добавления цены: " + res.error);
          setSuccess(undefined);
        }
      });
    });
  };

  const handleSync = (priceId: string) => {
    startTransition(() => {
      syncPrice({ priceId }).then((res) => {
        if (res.status === "success") {
          setSuccess("Цена успешно синхронизирована");
          setError(undefined);
          console.log(res.data);
        } else {
          setError("Ошибка синхронизации цены: " + res.error);
          setSuccess(undefined);
        }
      });
    });
  };

  return (
    <div className="p-4 flex flex-col gap-2">
      <h1 className="text-xl font-bold">Добавление цен из 1С</h1>
      <h2 className="font-bold">Уже добавленные цены</h2>
      <ul className="flex flex-col gap-2">
        {pricesInDb.map((price) => (
          <Card key={price.priceId}>
            <CardHeader>
              <CardTitle>{price.name}</CardTitle>
              <CardDescription>
                {price.code} - {price.currency}
              </CardDescription>
              <CardDescription suppressHydrationWarning>
                Последняя синхронизация:{" "}
                {price?.latestSyncCreatedAt
                  ? formatRelativeDate(price.latestSyncCreatedAt)
                  : "никогда"}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Button
                onClick={() => {
                  handleSync(price.priceId);
                }}
              >
                Синхронизовать
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  startTransition(() => {
                    deletePriceFromDb(price.priceId).then((res) => {
                      if (res.status === "success") {
                        setSuccess("Цена успешно удалена");
                        setError(undefined);
                      } else {
                        setError("Ошибка удаления цены: " + res.error);
                        setSuccess(undefined);
                      }
                    });
                  });
                }}
              >
                Удалить
              </Button>
            </CardFooter>
          </Card>
        ))}
      </ul>
      <Separator />
      <h2 className="font-bold">Добавить новую цену</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Select name="priceId">
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип цены" />
          </SelectTrigger>
          <SelectContent>
            {pricesToShow.map((pt) => (
              <SelectItem key={pt.Ref_Key} value={pt.Ref_Key}>
                {pt.Description} ({pt.ВалютаЦены.Description})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          disabled={isPending || pricesToShow.length === 0}
          className="w-full"
        >
          Добавить
        </Button>
      </form>
      <FormSuccess message={success} />
      <FormError message={error} />
      <FormError message={error} />
    </div>
  );
};

export default PriceAddForm;
