import type { Transaction } from "@/services/transactions";

export type AggregatedData = {
  rowValues: (string | number)[];
  columnValues: (string | number)[];
  cells: Record<string | number, Record<string | number, number>>;
  columnTotals: Record<string | number, number>;
};

export const getAggregations = (
  transactions: Transaction[],
  rowField: keyof Transaction,
  columnField: keyof Transaction,
): AggregatedData => {
  const uniqueRowValues = new Set<string | number>();
  const uniqueColumnValues = new Set<string | number>();
  for (const t of transactions) {
    uniqueRowValues.add(t[rowField]);
    uniqueColumnValues.add(t[columnField]);
  }

  const rowValues = Array.from(uniqueRowValues).sort();
  const columnValues = Array.from(uniqueColumnValues).sort();

  // initialize with zeros
  const cells: Record<string | number, Record<string | number, number>> = {};
  for (const rowValue of rowValues) {
    cells[rowValue] = {};
    for (const colValue of columnValues) {
      cells[rowValue][colValue] = 0;
    }
  }

  // aggregate
  for (const t of transactions) {
    const rowVal = t[rowField];
    const colVal = t[columnField];
    cells[rowVal][colVal] += t.amount;
  }

  const columnTotals: Record<string | number, number> = {};
  for (const colVal of columnValues) {
    let sum = 0;
    for (const rowVal of rowValues) {
      sum += cells[rowVal][colVal];
    }
    columnTotals[colVal] = sum;
  }

  return {
    rowValues,
    columnValues,
    cells,
    columnTotals,
  };
};
