"use client";

import React, { useState, useTransition } from "react";

import { syncManufacturers } from "@/actions/sync/manufacturers";
import { syncMeasurementUnits } from "@/actions/sync/measurement-units";
import { syncNomenclature } from "@/actions/sync/nomenclature";
import { syncNomenclatureTypes } from "@/actions/sync/nomenclature-types";
import { syncPrices } from "@/actions/sync/prices";
import { syncStock } from "@/actions/sync/stock";
import { testAction } from "@/actions/test";

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
      const result = await testAction();
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
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          type="submit"
          disabled={isPending}
          onClick={handleClick}
        >
          Sync nom
        </button>
        {error && <div>Error: {error}</div>}
        {success && <div>Success: {success}</div>}
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </form>
    </div>
  );
};

export default TestForm;
