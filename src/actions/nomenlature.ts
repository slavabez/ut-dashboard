"use server";

import { currentRole } from "@/lib/auth";
import { From1C } from "@/lib/odata";

export async function getNomenclatureTypes() {
  const role = await currentRole();

  if (!role) {
    return {
      success: false,
      error: "У вас недостаточно прав для этого действия",
    };
  }
  const types = await From1C.getAllNomenclatureTypes();
  console.log(types);
}
