import React from "react";

import { getPricesWithLatestSyncTime } from "@/actions/site-settings";
import PriceAdminSection from "@/app/(protected)/admin/prices/_components/price-admin-section";
import { From1C } from "@/lib/odata";

const AdminPricesPage = async () => {
  const allPricesFrom1C = await From1C.getAllPriceTypes();
  const allPricesInDb = await getPricesWithLatestSyncTime();

  if (allPricesInDb.status === "error") {
    return <div>Ошибка загрузки цен из базы данных</div>;
  }

  return (
    <PriceAdminSection
      pricesInDb={allPricesInDb.data}
      pricesFrom1C={allPricesFrom1C}
    />
  );
};

export default AdminPricesPage;
