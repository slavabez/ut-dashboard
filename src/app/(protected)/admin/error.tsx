"use client";

import { useEffect } from "react";

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
    <div className="flex flex-col items-center justify-center text-center space-y-4 m-4">
      <h2 className="text-2xl">Упс! Ошибочка</h2>
      <p>{error.message}</p>
      <Button onClick={() => reset()}>Попробовать еще раз</Button>
    </div>
  );
}
