"use server";

import { From1C } from "@/lib/odata";

export async function getNomenclatureTypes() {
  const types = await From1C.getAllNomenclatureTypes();
  console.log(types);
}
