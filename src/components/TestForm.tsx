"use client";

import React, { useState, useTransition } from "react";

import { syncAll } from "@/actions/sync/common";
import { Button } from "@/components/ui/button";

const TestForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [data, setData] = useState<any>();

  const handleClick = () => {
    setError("");
    setSuccess("");
    setData(undefined);

    startTransition(async () => {
      const result = await syncAll();
      if (result) {
        setData(result);
      } else {
        setError("Error while fetching data");
      }
    });
  };

  return (
    <div>
      <h2>Test form</h2>
      <form>
        <Button onClick={handleClick} disabled={isPending} type="button">
          Test action
        </Button>

        {error && <div>Error: {error}</div>}
        {success && <div>Success: {success}</div>}
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </form>
    </div>
  );
};

export default TestForm;
