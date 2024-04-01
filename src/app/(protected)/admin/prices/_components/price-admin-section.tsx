"use client";

import React, { useState } from "react";

import AddPriceForm from "@/app/(protected)/admin/prices/_components/add-price-form";
import PriceList from "@/app/(protected)/admin/prices/_components/price-list";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Separator } from "@/components/ui/separator";

interface IPriceAddFormProps {
  pricesInDb: any[];
  pricesFrom1C: any[];
}

const PriceAdminSection = (props: IPriceAddFormProps) => {
  const { pricesFrom1C, pricesInDb } = props;
  const [success, setSuccess] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const pricesToShow = pricesFrom1C.filter((pt) => {
    return !pricesInDb.some((price) => price.priceId === pt.Ref_Key);
  });

  return (
    <div className="flex flex-col gap-2 p-4">
      <h1 className="text-center text-xl font-bold">Добавление цен из 1С</h1>
      <p className="text-sm text-muted-foreground">
        На этой странице можно добавить цены из 1С. Цены, добавленные на сайт,
        будут доступны для синхронизации и дял прайс листов
      </p>
      <h2 className="text-center font-bold">Существующие цены</h2>
      <PriceList
        pricesInDb={pricesInDb}
        setSuccess={setSuccess}
        setError={setError}
      />
      <Separator />
      <h2 className="font-bold">Добавить новую цену</h2>
      <AddPriceForm
        pricesFrom1C={pricesFrom1C}
        pricesToShow={pricesToShow}
        setSuccess={setSuccess}
        setError={setError}
      />
      <FormSuccess message={success} />
      <FormError message={error} />
      <FormError message={error} />
    </div>
  );
};

export default PriceAdminSection;
