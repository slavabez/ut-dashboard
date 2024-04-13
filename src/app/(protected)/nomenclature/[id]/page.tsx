import Image from "next/image";
import React from "react";

import { getNomenclatureInfo } from "@/actions/nomenclature/items";
import Nomenclature1cLink from "@/app/(protected)/nomenclature/_components/nomenclature-1c-link";
import PageWrapper from "@/components/layout-components";
import { H1, H2, H3, Muted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
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
        <Nomenclature1cLink nomenclatureId={nomenclature.id} />
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
        <dt className="text-gray-500">В наличии</dt>
        <dd className="text-right font-bold">{nomenclature.stock ?? 0}</dd>
      </dl>
      <dl className="flex justify-between">
        <dt className="text-gray-500">Единица</dt>
        <dd className="text-right">{baseUnit?.name ?? "Не найдено"}</dd>
      </dl>
      <dl className="flex justify-between">
        <dt className="text-gray-500">Вид ассортимента</dt>
        <dd className="text-right">{nomenclature.type.name}</dd>
      </dl>
      <H3>Цены</H3>
      {formattedPrices.map((fp: any) => (
        <dl key={fp.priceId} className="flex justify-between">
          <dt className="text-gray-500">{fp.priceName}</dt>
          <dd className="text-right">
            {formatPrice(fp.priceValue, true)} за {fp.priceUnit}
          </dd>
        </dl>
      ))}
      <H3>Дополнительные единицы</H3>
      <div>
        {nomenclature.measurementUnits.map((mu: any) => (
          <Badge key={mu.id}>{mu.name}</Badge>
        ))}
      </div>
    </PageWrapper>
  );
};

export default NomenclatureDetailsPage;
