"use server";

import { lt } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { nomenclatures } from "@/drizzle/schema";
import { ConvertFrom1C } from "@/lib/1CAdapter";
import { From1C } from "@/lib/odata";

export async function testAction() {
  const res = await From1C.patchUserSitePassword({
    newPassword: "123123",
    userId: "f10f9345-f6f4-11ed-89ec-000c29dddd38",
  });
  return res;
}
