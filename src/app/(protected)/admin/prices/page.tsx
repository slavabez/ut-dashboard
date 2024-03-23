import React from "react";

import { getPricesInDb } from "@/actions/site-settings";
import PriceAddForm from "@/app/(protected)/admin/prices/_components/price-add-form";
import { From1C } from "@/lib/odata";

const AdminPricesPage = async () => {
  const allPricesFrom1C = await From1C.getAllPriceTypes();
  const allPricesInDb = await getPricesInDb();

  if (allPricesInDb.status === "error") {
    return <div>Ошибка загрузки цен из базы данных</div>;
  }

  return (
    <PriceAddForm
      pricesInDb={allPricesInDb.data}
      pricesFrom1C={allPricesFrom1C}
    />
  );
};

export default AdminPricesPage;
