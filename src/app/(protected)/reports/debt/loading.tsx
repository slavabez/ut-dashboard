import { HandCoins } from "lucide-react";
import React from "react";

import PageWrapper from "@/components/layout-components";
import { H1 } from "@/components/typography";

const DebtLoadingPage = () => {
  return (
    <PageWrapper>
      <H1>
        <HandCoins className="h-10 w-10" />
        Отчёты по долгам
      </H1>
      <div>
        <div className="h-20 w-full animate-pulse border-b-2 bg-orange-50 p-4 font-bold" />
        <div className="h-20 w-full animate-pulse border-b-2 bg-orange-50 p-4 font-bold" />
        <div className="h-20 w-full animate-pulse border-b-2 bg-orange-50 p-4 font-bold" />
        <div className="h-20 w-full animate-pulse border-b-2 bg-orange-50 p-4 font-bold" />
        <div className="h-20 w-full animate-pulse border-b-2 bg-orange-50 p-4 font-bold" />
        <div className="h-20 w-full animate-pulse border-b-2 bg-orange-50 p-4 font-bold" />
        <div className="h-20 w-full animate-pulse border-b-2 bg-orange-50 p-4 font-bold" />
      </div>
    </PageWrapper>
  );
};

export default DebtLoadingPage;
