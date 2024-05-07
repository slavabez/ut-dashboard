"use client";

import React, { useState } from "react";

import AddPriceForm from "@/app/(protected)/admin/prices/_components/add-price-form";
import PriceList from "@/app/(protected)/admin/prices/_components/price-list";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { PageWrapper } from "@/components/layout-components";
import { H1, H2, Muted } from "@/components/typography";
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
    <PageWrapper>
      <H1>Добавление цен из 1С</H1>
      <Muted>
        На этой странице можно добавить цены из 1С. Цены, добавленные на сайт,
        будут доступны для синхронизации и дял прайс листов
      </Muted>
      <H2>Существующие цены</H2>
      <PriceList
        pricesInDb={pricesInDb}
        setSuccess={setSuccess}
        setError={setError}
      />
      <Separator />
      <H2>Добавить новую цену</H2>
      <AddPriceForm
        pricesFrom1C={pricesFrom1C}
        pricesToShow={pricesToShow}
        setSuccess={setSuccess}
        setError={setError}
      />
      <FormSuccess message={success} />
      <FormError message={error} />
      <FormError message={error} />
    </PageWrapper>
  );
};

export default PriceAdminSection;
