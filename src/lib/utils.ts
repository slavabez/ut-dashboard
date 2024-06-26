import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { SyncFormType } from "@/app/(protected)/admin/sync/_components/SyncForm";
import { IOrder } from "@/lib/1c-adapter";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeStyle: "short",
  dateStyle: "medium",
});

const dateFormatterDateOnly = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
});

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeStyle: "short",
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generic function to arrange a list of objects (that have id and parentId) into a hierarchy
 *
 * @param items
 */
export function separateListIntoLevels<
  T extends { id?: string; parentId?: string | null },
>(items: T[]): { level: number; items: T[] }[] {
  const hierarchyMap: {
    [parentId: string]: T[];
  } = {};
  const processedIds = new Set<string>();

  // Group items by parentId
  for (const item of items) {
    const parentId = item.parentId || "";
    if (!hierarchyMap[parentId]) {
      hierarchyMap[parentId] = [];
    }
    hierarchyMap[parentId].push(item);
  }

  // Create a unified array for each hierarchy level
  const result: { level: number; items: T[] }[] = [];

  function processHierarchyLevel(parentId: string, level: number) {
    const levelItems = hierarchyMap[parentId] || [];
    if (levelItems.length === 0) {
      return;
    }

    result[level] = result[level] || { level, items: [] };
    for (const item of levelItems) {
      if (!item.id) continue;
      // Check for circular dependency
      if (processedIds.has(item.id)) {
        throw new Error("Circular dependency detected");
      }
      if (item.id) {
        processedIds.add(item.id);
      }

      result[level].items.push(item);
      if (item.id) {
        processHierarchyLevel(item.id, level + 1);
      }
    }
  }

  processHierarchyLevel("", 0);
  return result.filter((r) => r);
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
  // Replace spaces, brackets, and dashes
  let normalized = phone.replace(/[()\-\s]/g, "");
  if (normalized.startsWith("8")) {
    // Replace with +7
    normalized = "+7" + normalized.slice(1);
  }
  if (normalized.startsWith("7")) {
    normalized = "+" + normalized;
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

export function formatTime(date: Date | undefined): string {
  if (!date || !isValidDate(date)) return "";
  return timeFormatter.format(date);
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date || typeof date === "undefined") {
    return "никогда";
  }
  if (typeof date === "string") {
    date = new Date(date);
  }
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

export function formatPrice(price: number, divideByHundred = false): string {
  if (divideByHundred) {
    if (divideByHundred) {
      price = price / 100;
    }
  }
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

export function translateRole(role: string): string {
  switch (role) {
    case "admin":
      return "Администратор";
    case "employee":
      return "Сотрудник";
    case "client":
      return "Клиент";
    case "manager":
      return "Менеджер";
    default:
      return role;
  }
}

export function from1CIdToGuid(id: string): string {
  if (id.length !== 32) {
    throw new Error("Invalid 1C ID");
  }
  const parts = [
    id.substring(24),
    id.substring(20, 24),
    id.substring(16, 20),
    id.substring(0, 4),
    id.substring(4, 16),
  ];

  return parts.join("-");
}

export function fromGuidTo1CId(guid: string): string {
  if (guid.length !== 36) {
    throw new Error("Invalid GUID");
  }
  const parts = guid.split("-");
  return `${parts[3]}${parts[4]}${parts[2]}${parts[1]}${parts[0]}`;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function calculateGeoAverages(
  orders: IOrder[],
): { avgLat: number; avgLon: number; zoom: number } | null {
  let totalLat = 0;
  let totalLon = 0;
  let minLat = Number.MAX_VALUE;
  let maxLat = Number.MIN_VALUE;
  let minLon = Number.MAX_VALUE;
  let maxLon = Number.MIN_VALUE;
  let count = 0;
  orders.forEach((order) => {
    if (order.additionalProperties?.lat && order.additionalProperties?.lon) {
      let lat = order.additionalProperties.lat;
      let lon = order.additionalProperties.lon;

      totalLat += lat;
      totalLon += lon;

      // Update min and max lats and lons
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLon = Math.min(minLon, lon);
      maxLon = Math.max(maxLon, lon);

      count++;
    }
  });

  if (count === 0)
    return {
      avgLat: 53.29,
      avgLon: 69.39331,
      zoom: 12,
    };

  // Define a function to calculate the zoom level based on lat and lon range
  let calculateZoom = (
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number,
  ): number => {
    const diffLat = maxLat - minLat;
    const diffLon = maxLon - minLon;
    const latZoom = Math.round(-1.44 * Math.log(diffLat) + 8);
    const lonZoom = Math.round(-1.44 * Math.log(diffLon) + 8);
    return Math.min(latZoom, lonZoom);
  };

  return {
    avgLat: totalLat / count,
    avgLon: totalLon / count,
    zoom: calculateZoom(minLat, maxLat, minLon, maxLon),
  };
}

export function sortOrdersByAgentDateCreated(orders: IOrder[]) {
  return orders.sort((a, b) => {
    if (a.additionalProperties?.started && b.additionalProperties?.started) {
      return (
        b.additionalProperties.started.getDate() -
        a.additionalProperties.started.getDate()
      );
    }
    return 0;
  });
}
