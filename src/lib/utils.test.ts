import {
  calculateGeoAverages,
  from1CIdToGuid,
  fromGuidTo1CId,
  getDateFor1C,
  normalizePhoneNumber,
  separateListIntoLevels,
} from "./utils";
import { describe, expect, test } from "vitest";

import { IOrder } from "@/lib/1c-adapter";

describe("separateListIntoLevels function", () => {
  test("should correctly separate a list into hierarchy levels", async () => {
    const testItems = [
      { id: "1", parentId: null },
      { id: "2", parentId: "1" },
      { id: "3", parentId: "1" },
      { id: "4", parentId: "2" },
      { id: "5", parentId: "2" },
      { id: "6", parentId: "3" },
    ];

    const result = separateListIntoLevels(testItems);

    const expectedResult = [
      { level: 0, items: [{ id: "1", parentId: null }] },
      {
        level: 1,
        items: [
          { id: "2", parentId: "1" },
          { id: "3", parentId: "1" },
        ],
      },
      {
        level: 2,
        items: [
          { id: "4", parentId: "2" },
          { id: "5", parentId: "2" },
          { id: "6", parentId: "3" },
        ],
      },
    ];

    expect(result).toEqual(expectedResult);
  });

  test("should return an empty array when input array is empty", async () => {
    const result = separateListIntoLevels([]);

    expect(result).toEqual([]);
  });

  test("should handle items with nonexistent parent IDs correctly", async () => {
    const testItems = [
      { id: "1", parentId: null },
      { id: "2", parentId: "99" }, // Nonexistent parent ID
    ];

    const result = separateListIntoLevels(testItems);
    const expectedResult = [
      { level: 0, items: [{ id: "1", parentId: null }] },
      // Note: Depending on function's intended behavior, adjust the expected result
    ];

    expect(result).toEqual(expectedResult);
  });

  test("should correctly handle items with the same ID but different parent IDs", async () => {
    const testItems = [
      { id: "1", parentId: null },
      { id: "1", parentId: "2" },
    ];

    const result = separateListIntoLevels(testItems);
    const expectedResult = [{ level: 0, items: [{ id: "1", parentId: null }] }];

    expect(result).toEqual(expectedResult);
  });

  test("should handle non-string ID or ParentID values", async () => {
    const testItems = [
      { id: "1", parentId: null },
      { id: 2, parentId: "1" }, // Non-string ID
      { id: "3", parentId: 1 }, // Non-string ParentID
    ];

    // @ts-ignore
    const result = separateListIntoLevels(testItems);
    const expectedResult = [
      { level: 0, items: [{ id: "1", parentId: null }] },
      {
        level: 1,
        items: [
          { id: 2, parentId: "1" },
          { id: "3", parentId: 1 },
        ],
      },
    ];

    expect(result).toEqual(expectedResult);
  });
});

describe("normalizePhoneNumber function", () => {
  test("should return an empty string when phone is null, undefined or empty", () => {
    expect(normalizePhoneNumber(null)).toEqual("");
    expect(normalizePhoneNumber(undefined)).toEqual("");
    expect(normalizePhoneNumber("")).toEqual("");
  });

  test("should convert numeric phone numbers to string", () => {
    const result = normalizePhoneNumber(87775553009);
    expect(result).toEqual("+77775553009");
  });

  test("should replace spaces, brackets, and dashes", () => {
    const result = normalizePhoneNumber("(87775) 553-009");
    expect(result).toEqual("+77775553009");
  });

  test("should correctly replace 8 at the start of the phone number with +7", () => {
    const result = normalizePhoneNumber("87775553009");
    expect(result).toEqual("+77775553009");
  });

  test("should correctly add + at the start of the phone number that starts with 7", () => {
    const result = normalizePhoneNumber("77775553009");
    expect(result).toEqual("+77775553009");
  });
});

describe("getDateFor1C function", () => {
  test("should handle undefined input and return current date in YYYY-MM-DD format", async () => {
    const result = getDateFor1C();
    const date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const expectedDate = `${year}-${month}-${day}`;
    expect(result).toBe(expectedDate);
  });

  test("should format input date correctly in YYYY-MM-DD format", async () => {
    const inputDate = new Date("2020-05-15");
    const result = getDateFor1C(inputDate);
    expect(result).toBe("2020-05-15");
  });

  test("should handle dates on the first day of the month correctly", async () => {
    const inputDate = new Date("2022-11-01");
    const result = getDateFor1C(inputDate);
    expect(result).toBe("2022-11-01");
  });

  test("should handle leap years correctly", async () => {
    const inputDate = new Date("2020-02-29");
    const result = getDateFor1C(inputDate);
    expect(result).toBe("2020-02-29");
  });
});

describe("from1CIdToGuid function", () => {
  test("should correctly convert valid 1C IDs to GUIDs", async () => {
    const result = from1CIdToGuid("89ab000c29dddd3811ed88195828755a");
    expect(result).toBe("5828755a-8819-11ed-89ab-000c29dddd38");
  });

  test("should throw an error for invalid 1C IDs", async () => {
    expect(() => from1CIdToGuid("1234")).toThrow("Invalid 1C ID");
  });

  test("should throw an error for empty input", async () => {
    expect(() => from1CIdToGuid("")).toThrow("Invalid 1C ID");
  });
});

describe("fromGuidTo1CId function", () => {
  test("should correctly convert valid GUIDs to 1C IDs", async () => {
    const result = fromGuidTo1CId("5828755a-8819-11ed-89ab-000c29dddd38");
    expect(result).toBe("89ab000c29dddd3811ed88195828755a");
  });

  test("should throw an error for invalid GUIDs", async () => {
    expect(() => fromGuidTo1CId("invalid")).toThrow("Invalid GUID");
  });

  test("should throw an error for empty input", async () => {
    expect(() => fromGuidTo1CId("")).toThrow("Invalid GUID");
  });
});

describe("calculateGeoAverages function", () => {
  test("should correctly calculate geo averages", async () => {
    const orders: IOrder[] = [
      {
        id: "1",
        number: "A100",
        date: new Date(),
        sum: 10000,
        status: "Delivered",
        paymentType: "Cash",
        deliveryDate: "2022-12-15",
        deliveryAddress: "123, Street name, City, Country",
        deliveryType: "Delivery",
        deletionMark: false,
        partner: "Company A",
        comment: "Some Comment",
        items: [],
        additionalProperties: {
          lat: 40.712776,
          lon: -74.005974,
        },
      },
      {
        id: "2",
        number: "A101",
        date: new Date(),
        sum: 15000,
        status: "Delivered",
        paymentType: "Credit Card",
        deliveryDate: "2022-12-18",
        deliveryAddress: "456, Street name, City, Country",
        deliveryType: "Pickup",
        deletionMark: false,
        partner: "Company B",
        comment: "Another Comment",
        items: [],
        additionalProperties: {
          lat: 34.052235,
          lon: -118.243683,
        },
      },
    ];

    const result = calculateGeoAverages(orders);

    expect(result).toEqual({
      avgLat: 37.3825055,
      avgLon: -96.1248285,
      zoom: 1,
    });
  });

  test("should handle orders without lat and lon values", async () => {
    const orders: IOrder[] = [
      {
        id: "1",
        number: "A100",
        date: new Date(),
        sum: 10000,
        status: "Delivered",
        paymentType: "Cash",
        deliveryDate: "2022-12-15",
        deliveryAddress: "123, Street name, City, Country",
        deliveryType: "Delivery",
        deletionMark: false,
        partner: "Company A",
        comment: "Some Comment",
        items: [],
        additionalProperties: {},
      },
      {
        id: "2",
        number: "A101",
        date: new Date(),
        sum: 15000,
        status: "Delivered",
        paymentType: "Credit Card",
        deliveryDate: "2022-12-18",
        deliveryAddress: "456, Street name, City, Country",
        deliveryType: "Pickup",
        deletionMark: false,
        partner: "Company B",
        comment: "Another Comment",
        items: [],
        additionalProperties: {},
      },
    ];

    const result = calculateGeoAverages(orders);

    expect(result).toEqual({
      avgLat: 0,
      avgLon: 0,
      zoom: 5,
    });
  });
});
