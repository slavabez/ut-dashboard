"use server";

import { asc, eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { ManufacturerSelect, manufacturers } from "@/drizzle/schema";

export async function getManufacturersForSelect(): Promise<
  Pick<ManufacturerSelect, "id" | "name">[]
> {
  return await db.query.manufacturers.findMany({
    where: eq(manufacturers.deletionMark, false),
    columns: {
      id: true,
      name: true,
    },
    orderBy: asc(manufacturers.name),
  });
}
