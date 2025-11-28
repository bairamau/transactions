import type { Transaction } from "@/services/transactions";

export type Column = {
  key: string;
  primary: string | number;
  secondary?: string | number;
};

export type AggregatedData = {
  rowValues: (string | number)[];
  primaryColumnValues: (string | number)[];
  secondaryColumnValues: (string | number)[] | null;
  columnValues: Column[];
  cells: Record<string | number, Record<string, number>>;
  columnTotals: Record<string, number>;
};

export const getAggregations = (
  transactions: Transaction[],
  rowField: keyof Transaction,
  primaryColumnField: keyof Transaction,
  secondaryColumnField?: keyof Transaction,
): AggregatedData => {
  // Extract unique values
  const uniqueRowValues = new Set<string | number>();
  const uniquePrimaryColumnValues = new Set<string | number>();
  const uniqueSecondaryColumnValues = secondaryColumnField
    ? new Set<string | number>()
    : null;

  for (const t of transactions) {
    uniqueRowValues.add(t[rowField]);
    uniquePrimaryColumnValues.add(t[primaryColumnField]);
    if (secondaryColumnField && uniqueSecondaryColumnValues) {
      uniqueSecondaryColumnValues.add(t[secondaryColumnField]);
    }
  }

  const rowValues = Array.from(uniqueRowValues).sort();
  const primaryColumnValues = Array.from(uniquePrimaryColumnValues).sort();
  const secondaryColumnValues = uniqueSecondaryColumnValues
    ? Array.from(uniqueSecondaryColumnValues).sort()
    : null;

  // Generate column values
  const columnValues: Column[] = [];
  if (secondaryColumnValues) {
    // Two-level
    for (const primary of primaryColumnValues) {
      for (const secondary of secondaryColumnValues) {
        columnValues.push({
          key: `${primary}|${secondary}`,
          primary,
          secondary,
        });
      }
    }
  } else {
    // Single-level
    for (const primary of primaryColumnValues) {
      columnValues.push({
        key: String(primary),
        primary,
      });
    }
  }

  // Initialize cells
  const cells: Record<string | number, Record<string, number>> = {};
  for (const row of rowValues) {
    cells[row] = {};
    for (const col of columnValues) {
      cells[row][col.key] = 0;
    }
  }

  // Aggregate
  for (const t of transactions) {
    const row = t[rowField];
    const primary = t[primaryColumnField];
    const secondary = secondaryColumnField ? t[secondaryColumnField] : undefined;
    const key = secondary !== undefined ? `${primary}|${secondary}` : String(primary);
    cells[row][key] += t.amount;
  }

  // Column totals
  const columnTotals: Record<string, number> = {};
  for (const col of columnValues) {
    let sum = 0;
    for (const row of rowValues) {
      sum += cells[row][col.key];
    }
    columnTotals[col.key] = sum;
  }

  return {
    rowValues,
    primaryColumnValues,
    secondaryColumnValues,
    columnValues,
    cells,
    columnTotals,
  };
};
