"use server";

import { currentRole } from "@/lib/auth";

export async function testAction() {
  const role = await currentRole();

  if (role !== "admin") {
    return {
      success: false,
      error: "У вас недостаточно прав для этого действия",
    };
  }
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
