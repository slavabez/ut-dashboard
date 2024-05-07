import React from "react";

import { getPricesWithLatestSyncTime } from "@/actions/site-settings";
import PriceAdminSection from "@/app/(protected)/admin/prices/_components/price-admin-section";
import { PageWrapper } from "@/components/layout-components";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAllPriceTypesFrom1C } from "@/lib/odata/prices";

export const dynamic = "force-dynamic";

const AdminPricesPage = async () => {
  const allPricesResponse = await getPricesWithLatestSyncTime();

  if (allPricesResponse.status === "error") {
    return (
      <PageWrapper>
        <Alert>
          <AlertTitle>Ошибка загрузки цен из базы данных</AlertTitle>
          <AlertDescription>{allPricesResponse.error}</AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }
  const allPricesFrom1C = await getAllPriceTypesFrom1C();

  return (
    <PriceAdminSection
      pricesInDb={allPricesResponse.data}
      pricesFrom1C={allPricesFrom1C}
    />
  );
};

export default AdminPricesPage;
