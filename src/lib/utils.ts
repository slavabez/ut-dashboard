import { type ClassValue, clsx } from "clsx";
import React from "react";
import { BiBasket } from "react-icons/bi";
import { CiBoxes } from "react-icons/ci";
import { IoIosPricetags } from "react-icons/io";
import {
  MdOutlineFactory,
  MdOutlineShoppingBasket,
  MdOutlineWarehouse,
} from "react-icons/md";
import { twMerge } from "tailwind-merge";

import { SyncFormType } from "@/app/(protected)/admin/sync/_components/SyncForm";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeStyle: "short",
  dateStyle: "medium",
});

const dateFormatterShort = new Intl.DateTimeFormat("ru-RU", {
  timeStyle: "short",
  dateStyle: "short",
});

const dateFormatterDateOnly = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generic function to arrange a list of objects (that have id and parentId) into a hierarchy
 *
 * @param items
 */
export function separateListIntoLevels<
  T extends { id?: string | null; parentId?: string | null },
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

export function sortLevelsIntoTree<
  T extends { id: string; parentId: string; children: T[] },
>(levels: { level: number; items: T[] }[]): T[] {
  const tree: T[] = [];
  const levelMap: { [id: string]: T } = {};

  for (const level of levels) {
    for (const item of level.items) {
      const parent = levelMap[item.parentId];
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(item);
      } else {
        tree.push(item);
      }
      levelMap[item.id] = item;
    }
  }

  return tree;
}

export function flattenTree<T extends { id: string; children: T[] }>(
  tree: T[],
): T[] {
  const result: T[] = [];
  for (const item of tree) {
    result.push(item);
    if (item.children) {
      result.push(...flattenTree(item.children));
    }
  }
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
      return "Виды номенклатуры";
    case "prices":
      return "Цены";
    case "stock":
      return "Остатки";
    default:
      return "Неизвестный тип";
  }
}

export function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

export function formatDate(date: Date): string {
  if (!isValidDate(date)) {
    return "";
  }
  return dateFormatter.format(date);
}

export function formatDateShort(date: Date): string {
  if (!isValidDate(date)) {
    return "";
  }
  return dateFormatterDateOnly.format(date);
}

export function timeAgo(date: Date): string {
  const now = new Date();

  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  const rtf = new Intl.RelativeTimeFormat("ru", { numeric: "auto" });

  if (seconds < 60) {
    return rtf.format(-seconds, "second");
  } else if (minutes < 60) {
    return rtf.format(-minutes, "minute");
  } else if (hours < 24) {
    return rtf.format(-hours, "hour");
  } else if (days < 30) {
    return rtf.format(-days, "day");
  } else if (months < 12) {
    return rtf.format(-months, "month");
  } else {
    return rtf.format(-years, "year");
  }
}

export function getDateFor1C(inputDate?: Date): string {
  const date = inputDate ? new Date(inputDate) : new Date();
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

export function format1CDocumentNumber(number: string): string {
  const parts = number.split("-");
  return `${parts[0].replace(/^0+/, "")}-${parseInt(parts[1])}`;
}

export function formatPrice(price: number): string {
  return price.toLocaleString("ru-KZ", {
    style: "currency",
    currency: "KZT",
  });
}

export function translateDeliveryType(type: string): string {
  switch (type) {
    case "Самовывоз":
      return "Самовывоз";
    case "ДоКлиента":
      return "Доставка до клиента";
    default:
      return type;
  }
}
