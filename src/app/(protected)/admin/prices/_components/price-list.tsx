import React from "react";

import SyncAndDeleteButtons from "@/app/(protected)/admin/prices/_components/sync-delete-buttons";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";

interface IPriceListProps {
  pricesInDb: any[];
  setSuccess: (message: string | undefined) => void;
  setError: (message: string | undefined) => void;
}

const PriceList = ({ pricesInDb, setSuccess, setError }: IPriceListProps) => {
  return (
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
                ? // TODO: Fix the error in time diff calculations, time is treated as local not UTC
                  timeAgo(price.latestSyncCreatedAt)
                : "никогда"}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between">
            <SyncAndDeleteButtons
              priceId={price.priceId}
              setSuccess={setSuccess}
              setError={setError}
            />
          </CardFooter>
        </Card>
      ))}
    </ul>
  );
};

export default PriceList;
