import { Truck } from "lucide-react";
import React from "react";

import { PageWrapper } from "@/components/layout-components";
import LinkButton from "@/components/link-button";
import { H1 } from "@/components/typography";

export const dynamic = "force-dynamic";

const ManagerHomePage = async () => {
  return (
    <PageWrapper>
      <H1>Раздел для менеджеров</H1>
      <nav className="flex flex-col gap-4">
        <LinkButton href="/manager/employee-tracking">
          <Truck size={24} />
          Контроль передвижения торговых агентов
        </LinkButton>
      </nav>
    </PageWrapper>
  );
};

export default ManagerHomePage;
