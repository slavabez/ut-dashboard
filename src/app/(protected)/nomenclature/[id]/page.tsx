import Image from "next/image";
import React from "react";

import { getNomenclatureInfo } from "@/actions/nomenclature/items";
import Nomenclature1cLink from "@/app/(protected)/nomenclature/_components/nomenclature-1c-link";
import PageWrapper from "@/components/layout-components";
import { H1, H3, Muted } from "@/components/typography";
import { formatPrice, timeAgo } from "@/lib/utils";

const NomenclatureDetailsPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  const { id } = params;
  const response = await getNomenclatureInfo(id);

  if (response.status === "error") {
    return (
      <PageWrapper>
        <H1>Ошибка получения данных для товара</H1>
        <Muted>{response.error}</Muted>
      </PageWrapper>
    );
  }

  const { nomenclature, priceInfo, baseUnits } = response.data;

  const baseUnit = baseUnits.find(
    (unit: any) => unit.id === nomenclature.baseUnitId,
  );

  const formattedPrices = nomenclature.prices.map((p: any) => {
    const price = priceInfo.find((pr: any) => pr.id === p.priceId);
    let priceUnit = baseUnit?.name;

    if (p.measureUnitId) {
      priceUnit = nomenclature.measurementUnits.find(
        (mu: any) => mu.id === p.measureUnitId,
      )?.name;
    }

    return {
      priceId: price?.id,
      priceValue: p.price,
      priceName: price?.name,
      priceUnit,
    };
  });

  return (
    <PageWrapper>
      <H1>
        {response.data.nomenclature.name}
        <Nomenclature1cLink
          nomenclatureId={nomenclature.id}
          className="h-10 w-10"
        />
      </H1>
      <Muted>Данные обновлены {timeAgo(nomenclature.updatedAt)}</Muted>
      <Image
        src={nomenclature.coverImage ?? "https://placehold.co/600"}
        alt={nomenclature.name}
        width={600}
        height={600}
      />
      <dl className="flex justify-between">
        <dt className="text-gray-500">Производитель</dt>
        <dd className="text-right">{nomenclature.manufacturer.name}</dd>
      </dl>
      <dl className="flex justify-between">
        <dt className="text-gray-500">Вид ассортимента</dt>
        <dd className="text-right">{nomenclature.type.name}</dd>
      </dl>
      <dl className="flex justify-between">
        <dt className="text-gray-500">В наличии</dt>
        <dd className="text-right font-bold">
          {nomenclature.stock ?? 0} {baseUnit?.name ?? "Не найдено"}
        </dd>
      </dl>
      {nomenclature.measurementUnits.map((mu: any) => (
        <dl className="flex justify-between" key={mu.id}>
          <dt className="text-gray-500"></dt>
          <dd className="text-right">
            или{" "}
            <span className="font-bold">
              {(nomenclature.stock / (mu.numerator / mu.denominator)).toFixed(
                2,
              )}{" "}
            </span>
            {mu.name}
          </dd>
        </dl>
      ))}
      <dl className="flex justify-between">
        <dt className="text-gray-500">Единица</dt>
        <dd className="text-right">{baseUnit?.name ?? "Не найдено"}</dd>
      </dl>
      <H3>Дополнительные единицы</H3>
      {nomenclature.measurementUnits.map((mu: any) => (
        <dl className="flex justify-between" key={mu.id}>
          <dt className="text-gray-500">{mu.name}</dt>
          <dd className="text-right">
            Коэф.: {mu.numerator / mu.denominator}
            {baseUnit?.name}
          </dd>
        </dl>
      ))}
      <H3>Цены</H3>
      {formattedPrices.map((fp: any) => (
        <div
          key={fp.priceId}
          className="space-y-4 rounded-lg border-2 border-orange-500 p-2 shadow-md"
        >
          <dl key={fp.priceId} className="flex justify-between">
            <dt className="text-gray-500">{fp.priceName}</dt>
            <dd className="text-right">
              <span className="font-bold">
                {formatPrice(fp.priceValue, true)}
              </span>{" "}
              за {fp.priceUnit}
            </dd>
          </dl>
          {nomenclature.measurementUnits.map((mu: any) => (
            <dl className="flex justify-between" key={mu.id}>
              <dt className="text-gray-500"></dt>
              <dd className="text-right ">
                <span className="font-bold">
                  {formatPrice(
                    fp.priceValue * (mu.numerator / mu.denominator),
                    true,
                  )}
                </span>

                {` за ${mu.name}`}
              </dd>
            </dl>
          ))}
        </div>
      ))}
    </PageWrapper>
  );
};

export default NomenclatureDetailsPage;
