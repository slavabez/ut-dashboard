"use client";

import React, { useState, useTransition } from "react";

import { clearRedisCache } from "@/actions/site-settings";
import { Button } from "@/components/ui/button";

const RedisClearCacheButton = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const handleClick = () => {
    startTransition(() => {
      clearRedisCache().then((res) => {
        if (res.status === "error") {
          setError(res.error);
        }
        setError(undefined);
      });
    });
  };
  return (
    <Button onClick={handleClick} disabled={isPending}>
      {error ? error : "Очистить кэш Redis"}
      {isPending && "..."}
    </Button>
  );
};

export default RedisClearCacheButton;
