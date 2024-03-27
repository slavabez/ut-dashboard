// AddPriceForm.jsx
import React, { useTransition } from "react";

import { addNewPriceToDb } from "@/actions/site-settings";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceInsert } from "@/drizzle/schema";

interface IAddPriceFormProps {
  pricesToShow: any[];
  pricesFrom1C: any[];
  setSuccess: (message: string | undefined) => void;
  setError: (message: string | undefined) => void;
}

const AddPriceForm = ({
  pricesToShow,
  pricesFrom1C,
  setError,
  setSuccess,
}: IAddPriceFormProps) => {
  const [isPending, startTransition] = useTransition();

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

  return (
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
  );
};

export default AddPriceForm;
