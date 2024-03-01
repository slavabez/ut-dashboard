"use server";

import { eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { manufacturers } from "@/drizzle/schema";

export async function getManufacturerWithNomenclature(manufacturerId: string) {
  if (!manufacturerId) {
    return null;
  }
  return db.query.manufacturers.findFirst({
    where: eq(manufacturers.id, manufacturerId),
    with: {
      nomenclatures: true,
    },
  });
}
