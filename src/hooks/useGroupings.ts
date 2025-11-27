import { useReducer } from "react";

const ALL_FIELDS = ["transaction_type", "status", "year"] as const;

type GroupingField = (typeof ALL_FIELDS)[number];

type GroupingState = {
  row: GroupingField;
  column: GroupingField;
  secondaryColumn: GroupingField | null;
};

type GroupingAction =
  | { type: "SET_ROW"; payload: GroupingField }
  | { type: "SET_COLUMN"; payload: GroupingField }
  | { type: "SET_SECONDARY_COLUMN"; payload: GroupingField | null };

const groupingReducer = (
  state: GroupingState,
  action: GroupingAction,
): GroupingState => {
  switch (action.type) {
    case "SET_ROW": {
      const newRow = action.payload;
      // If new row conflicts with primary column, pick first available
      if (newRow === state.column) {
        const available = ALL_FIELDS.filter((f) => f !== newRow);
        return {
          row: newRow,
          column: available[0],
          secondaryColumn: null
        };
      }
      // If conflicts with secondary column, clear it
      if (newRow === state.secondaryColumn) {
        return { ...state, row: newRow, secondaryColumn: null };
      }
      return { ...state, row: newRow };
    }
    case "SET_COLUMN": {
      const newColumn = action.payload;
      // Prevent setting column to same value as row
      if (newColumn === state.row) {
        return state;
      }
      // Clear secondary column if it conflicts
      if (newColumn === state.secondaryColumn) {
        return { ...state, column: newColumn, secondaryColumn: null };
      }
      return { ...state, column: newColumn };
    }
    case "SET_SECONDARY_COLUMN": {
      const newSecondary = action.payload;
      // Prevent conflicts
      if (newSecondary === state.row || newSecondary === state.column) {
        return state;
      }
      return { ...state, secondaryColumn: newSecondary };
    }
    default:
      return state;
  }
};

export const useGroupings = () => {
  const [groupings, dispatch] = useReducer(groupingReducer, {
    row: "year",
    column: "status",
    secondaryColumn: null,
  });

  const availableColumnFields = ALL_FIELDS.filter(
    (field) => field !== groupings.row,
  );

  const availableSecondaryColumnFields = ALL_FIELDS.filter(
    (field) => field !== groupings.row && field !== groupings.column,
  );

  return {
    groupings,
    dispatch,
    availableColumnFields,
    availableSecondaryColumnFields,
    rowFields: ALL_FIELDS,
  };
};

export type { GroupingField, GroupingAction };
