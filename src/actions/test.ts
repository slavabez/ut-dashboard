"use server";

import { lt } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { nomenclatures } from "@/drizzle/schema";
import { From1C } from "@/lib/odata";

export async function testAction() {
  return From1C.getAllUsers();
}
