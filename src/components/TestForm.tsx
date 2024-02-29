"use client";

import React, { useState, useTransition } from "react";

import { syncNomenclatureTypes } from "@/actions/sync";

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
      const result = await syncNomenclatureTypes();
      if (result.success) {
        setSuccess("Sync successful");
        setData(result.syncResult);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <h2>Test form</h2>
      <form>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          type="submit"
          disabled={isPending}
          onClick={handleClick}
        >
          Sync nom types
        </button>
        {error && <div>Error: {error}</div>}
        {success && <div>Success: {success}</div>}
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </form>
    </div>
  );
};

export default TestForm;
