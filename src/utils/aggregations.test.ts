import { test, expect } from "vitest";
import { getAggregations } from "./aggregations";
import type { Transaction } from "@/services/transactions";

const mockTransactions: Transaction[] = [
  {
    transaction_type: "invoice",
    transaction_number: "1",
    amount: 100,
    status: "paid",
    year: 2023,
  },
  {
    transaction_type: "invoice",
    transaction_number: "2",
    amount: 200,
    status: "unpaid",
    year: 2023,
  },
  {
    transaction_type: "bill",
    transaction_number: "3",
    amount: 50,
    status: "paid",
    year: 2023,
  },
  {
    transaction_type: "invoice",
    transaction_number: "4",
    amount: 150,
    status: "paid",
    year: 2024,
  },
  {
    transaction_type: "bill",
    transaction_number: "5",
    amount: 75,
    status: "partially_paid",
    year: 2024,
  },
];

test("groups transactions by row and column fields", () => {
  const result = getAggregations(mockTransactions, "year", "status");

  expect(result.rowValues).toEqual([2023, 2024]);
  expect(result.primaryColumnValues).toEqual([
    "paid",
    "partially_paid",
    "unpaid",
  ]);
  expect(result.secondaryColumnValues).toBeNull();
});

test("computes correct cell totals for single-level columns", () => {
  const result = getAggregations(mockTransactions, "year", "status");

  expect(result.cells[2023]["paid"]).toBe(150);
  expect(result.cells[2023]["unpaid"]).toBe(200);
  expect(result.cells[2023]["partially_paid"]).toBe(0);
  expect(result.cells[2024]["paid"]).toBe(150);
  expect(result.cells[2024]["partially_paid"]).toBe(75);
  expect(result.cells[2024]["unpaid"]).toBe(0);
});

test("computes correct column totals for single-level columns", () => {
  const result = getAggregations(mockTransactions, "year", "status");

  expect(result.columnTotals["paid"]).toBe(300);
  expect(result.columnTotals["partially_paid"]).toBe(75);
  expect(result.columnTotals["unpaid"]).toBe(200);
});

test("generates correct column values without secondary", () => {
  const result = getAggregations(mockTransactions, "transaction_type", "year");

  expect(result.columnValues).toEqual([
    { key: "2023", primary: 2023 },
    { key: "2024", primary: 2024 },
  ]);
});

test("derives distinct values for primary and secondary columns", () => {
  const result = getAggregations(
    mockTransactions,
    "year",
    "transaction_type",
    "status",
  );

  expect(result.primaryColumnValues).toEqual(["bill", "invoice"]);
  expect(result.secondaryColumnValues).toEqual([
    "paid",
    "partially_paid",
    "unpaid",
  ]);
});

test("computes correct cell totals with two-level columns", () => {
  const result = getAggregations(
    mockTransactions,
    "year",
    "transaction_type",
    "status",
  );

  expect(result.cells[2023]["invoice|paid"]).toBe(100);
  expect(result.cells[2023]["invoice|unpaid"]).toBe(200);
  expect(result.cells[2023]["bill|paid"]).toBe(50);
  expect(result.cells[2023]["bill|partially_paid"]).toBe(0);
  expect(result.cells[2024]["invoice|paid"]).toBe(150);
  expect(result.cells[2024]["bill|partially_paid"]).toBe(75);
});

test("computes correct column totals with two-level columns", () => {
  const result = getAggregations(
    mockTransactions,
    "year",
    "transaction_type",
    "status",
  );

  expect(result.columnTotals["invoice|paid"]).toBe(250);
  expect(result.columnTotals["invoice|unpaid"]).toBe(200);
  expect(result.columnTotals["bill|paid"]).toBe(50);
  expect(result.columnTotals["bill|partially_paid"]).toBe(75);
});

test("generates correct column values with secondary", () => {
  const result = getAggregations(
    mockTransactions,
    "year",
    "transaction_type",
    "status",
  );

  expect(result.columnValues).toEqual([
    { key: "bill|paid", primary: "bill", secondary: "paid" },
    {
      key: "bill|partially_paid",
      primary: "bill",
      secondary: "partially_paid",
    },
    {
      key: "bill|unpaid",
      primary: "bill",
      secondary: "unpaid",
    },
    { key: "invoice|paid", primary: "invoice", secondary: "paid" },
    {
      key: "invoice|partially_paid",
      primary: "invoice",
      secondary: "partially_paid",
    },
    {
      key: "invoice|unpaid",
      primary: "invoice",
      secondary: "unpaid",
    },
  ]);
});

test("handles empty transaction array", () => {
  const result = getAggregations([], "year", "status");

  expect(result.rowValues).toEqual([]);
  expect(result.primaryColumnValues).toEqual([]);
  expect(result.columnValues).toEqual([]);
  expect(result.cells).toEqual({});
  expect(result.columnTotals).toEqual({});
});

test("handles single transaction", () => {
  const single: Transaction[] = [
    {
      transaction_type: "sale",
      transaction_number: "1",
      amount: 100,
      status: "completed",
      year: 2023,
    },
  ];
  const result = getAggregations(single, "year", "status");

  expect(result.rowValues).toEqual([2023]);
  expect(result.primaryColumnValues).toEqual(["completed"]);
  expect(result.cells[2023]["completed"]).toBe(100);
  expect(result.columnTotals["completed"]).toBe(100);
});

test("initializes cells with zero for missing combinations", () => {
  const sparse: Transaction[] = [
    {
      transaction_type: "sale",
      transaction_number: "1",
      amount: 100,
      status: "completed",
      year: 2023,
    },
    {
      transaction_type: "refund",
      transaction_number: "2",
      amount: 50,
      status: "pending",
      year: 2024,
    },
  ];
  const result = getAggregations(sparse, "year", "status");

  expect(result.cells[2023]["completed"]).toBe(100);
  expect(result.cells[2023]["pending"]).toBe(0);
  expect(result.cells[2024]["completed"]).toBe(0);
  expect(result.cells[2024]["pending"]).toBe(50);
});

test("aggregates multiple transactions in same cell", () => {
  const duplicates: Transaction[] = [
    {
      transaction_type: "sale",
      transaction_number: "1",
      amount: 100,
      status: "completed",
      year: 2023,
    },
    {
      transaction_type: "sale",
      transaction_number: "2",
      amount: 150,
      status: "completed",
      year: 2023,
    },
    {
      transaction_type: "sale",
      transaction_number: "3",
      amount: 75,
      status: "completed",
      year: 2023,
    },
  ];
  const result = getAggregations(duplicates, "year", "status");

  expect(result.cells[2023]["completed"]).toBe(325);
  expect(result.columnTotals["completed"]).toBe(325);
});

test("sorts row and column values", () => {
  const unsorted: Transaction[] = [
    {
      transaction_type: "sale",
      transaction_number: "1",
      amount: 100,
      status: "pending",
      year: 2025,
    },
    {
      transaction_type: "refund",
      transaction_number: "2",
      amount: 50,
      status: "completed",
      year: 2023,
    },
    {
      transaction_type: "sale",
      transaction_number: "3",
      amount: 75,
      status: "cancelled",
      year: 2024,
    },
  ];
  const result = getAggregations(unsorted, "year", "status");

  expect(result.rowValues).toEqual([2023, 2024, 2025]);
  expect(result.primaryColumnValues).toEqual([
    "cancelled",
    "completed",
    "pending",
  ]);
});

test("works with transaction_type as row", () => {
  const result = getAggregations(mockTransactions, "transaction_type", "year");

  expect(result.rowValues).toEqual(["bill", "invoice"]);
  expect(result.cells["invoice"][2023]).toBe(300);
  expect(result.cells["bill"][2023]).toBe(50);
});

test("works with status as row and transaction_type as column", () => {
  const result = getAggregations(
    mockTransactions,
    "status",
    "transaction_type",
  );

  expect(result.rowValues).toEqual(["paid", "partially_paid", "unpaid"]);
  expect(result.cells["unpaid"]["bill"]).toBe(0);
  expect(result.cells["paid"]["invoice"]).toBe(250);
});
