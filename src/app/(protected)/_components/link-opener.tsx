"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { from1CIdToGuid } from "@/lib/utils";

const LinkOpener = () => {
  const router = useRouter();
  const [link, setLink] = useState("");

  const handleOpenLink = () => {
    // Determine the type of link
    // IF it has the text Документ.ЗаказКлиента, then it's an order
    if (link.includes("Документ.ЗаказКлиента")) {
      const ref = link.split("ref=")[1];
      router.push(`/orders/${from1CIdToGuid(ref)}`);
    }
    if (link.includes("Документ.РеализацияТоваровУслуг")) {
      const ref = link.split("ref=")[1];
      router.push(`/sale-document/${from1CIdToGuid(ref)}`);
    }
    // TODO: handle other types of links
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Открыть ссылку из 1С</CardTitle>
        <CardDescription>
          Сюда можно вставить внешнюю ссылку из 1С. Пока поддерживается только
          тип ссылки Заказ Клиента
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          value={link}
          onChange={(event) => {
            setLink(event.target.value);
          }}
          placeholder="Ссылка в формате e1c://server/..."
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleOpenLink}>Открыть</Button>
      </CardFooter>
    </Card>
  );
};

export default LinkOpener;
