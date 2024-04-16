import { CalendarDays } from "lucide-react";
import React from "react";

import PageWrapper from "@/components/layout-components";
import { H1 } from "@/components/typography";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const MyComponent = () => {
  return (
    <PageWrapper>
      <H1>
        <CalendarDays className="h-10 w-10" /> Заказы по дате создания
      </H1>
      <Skeleton className="h-12 w-full" />
      <Separator />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Separator />
    </PageWrapper>
  );
};

export default MyComponent;
