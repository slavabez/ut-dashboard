"use client";

import { useEffect } from "react";

import { PageWrapper } from "@/components/layout-components";
import { H1 } from "@/components/typography";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageWrapper>
      <H1>Упс! Ошибочка</H1>
      <p>{error.message}</p>
      <Button onClick={() => reset()}>Попробовать еще раз</Button>
    </PageWrapper>
  );
}
