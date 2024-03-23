"use server";

import { eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { nomenclatures } from "@/drizzle/schema";
import { currentRole } from "@/lib/auth";

export async function testAction() {
  const noms = await db.query.nomenclatures.findMany({
    where: eq(nomenclatures.id, "5a75e2f1-6c9f-11ec-88f2-000c29dddd38"),
    with: {
      prices: true,
      type: true,
      measurementUnits: true,
      manufacturer: true,
    },
  });
  return { noms };
}

export async function adminAction() {
  const role = await currentRole();

  if (role === "admin") {
    return { success: "Allowed Server Action!" };
  }

  return { error: "Forbidden Server Action!" };
}

export async function employeeAction() {
  const role = await currentRole();

  if (role === "employee" || role === "admin") {
    return { success: "Allowed Server Action!" };
  }

  return { error: "Forbidden Server Action!" };
}

export async function userAction() {
  const role = await currentRole();

  if (role) {
    return { success: "Allowed Server Action!" };
  }

  return { error: "Forbidden Server Action!" };
}
