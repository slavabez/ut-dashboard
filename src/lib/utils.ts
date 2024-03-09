import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { SyncFormType } from "@/app/(protected)/admin/sync/_components/SyncForm";
import { SyncType } from "@/lib/sync";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeStyle: "short",
  dateStyle: "medium",
});

const relativeDateFormatter = new Intl.RelativeTimeFormat("ru-RU", {
  numeric: "auto",
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generic function to arrange a list of objects (that have id and parentId) into a hierarchy
export function separateListIntoLevels<
  T extends { id?: string | undefined; parentId?: string | null },
>(items: T[]): { level: number; items: T[] }[] {
  const hierarchyMap: {
    [parentId: string]: T[];
  } = {};

  // Group items by parentId
  for (const type of items) {
    const parentId = type.parentId || "";
    if (!hierarchyMap[parentId]) {
      hierarchyMap[parentId] = [];
    }
    hierarchyMap[parentId]?.push(type);
  }

  // Create a unified array for each hierarchy level
  const result: {
    level: number;
    items: T[];
  }[] = [];

  function processHierarchyLevel(parentId: string, level: number) {
    const levelItems = hierarchyMap[parentId] || [];
    if (levelItems.length === 0) {
      return;
    }

    for (const levelItem of levelItems) {
      result[level] = result[level] || { level, items: [] };
      result[level]?.items.push(levelItem);
      processHierarchyLevel(levelItem.id ?? "", level + 1);
    }
  }

  processHierarchyLevel("", 0);
  return result;
}

export function normalizePhoneNumber(
  phone: string | null | undefined | number,
): string {
  if (!phone) {
    return "";
  }
  if (typeof phone === "number") {
    return normalizePhoneNumber(phone.toString());
  }
  // Replace spaces, brackets and dashes
  let normalized = phone.replace(/[\s()-]/g, "");
  if (normalized.startsWith("8")) {
    normalized = normalized.replace("8", "+7");
  }
  return normalized;
}

export function parseBoolean(value: string | boolean | number): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  return value === "true";
}

export function translateSyncType(type: SyncFormType): string {
  switch (type) {
    case "all":
      return "Все данные";
    case "manufacturers":
      return "Производители";
    case "measurement-units":
      return "Единицы измерения";
    case "nomenclature":
      return "Номенклатура";
    case "nomenclature-types":
      return "Типы номенклатуры";
    case "prices":
      return "Цены";
    case "stock":
      return "Остатки";
  }
}

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return relativeDateFormatter.format(Math.round(diff / 1000), "seconds");
}

export function formatHoursAgo(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return relativeDateFormatter.format(
    Math.round(diff / (60 * 60 * 1000)),
    "hours",
  );
}
