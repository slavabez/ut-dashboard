import { HandCoins } from "lucide-react";
import React from "react";

import { getDebtForUser } from "@/actions/sale-document";
import DebtReportItem from "@/app/(protected)/reports/debt/_components/debt-report-item";
import { PageWrapper } from "@/components/layout-components";
import { H1 } from "@/components/typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

const DebtReport = async () => {
  const debts = await getDebtForUser();

  if (debts.status === "error") {
    return (
      <PageWrapper>
        <Alert variant="destructive">
          <AlertTitle>Ошибка при получении данных</AlertTitle>
          <AlertDescription>{debts.error}</AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <H1>
        <HandCoins className="h-10 w-10" />
        Отчёты по долгам
      </H1>
      <div>
        {debts.data?.map((d) => (
          <DebtReportItem key={d.counterpartyId} item={d} />
        ))}
      </div>
    </PageWrapper>
  );
};

export default DebtReport;
