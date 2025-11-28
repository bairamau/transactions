import { useReducer, useEffect } from "react";

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

      if (newRow === state.column) {
        const available = ALL_FIELDS.filter((f) => f !== newRow);
        return {
          row: newRow,
          column: available[0],
          secondaryColumn: null,
        };
      }

      if (newRow === state.secondaryColumn) {
        return { ...state, row: newRow, secondaryColumn: null };
      }
      return { ...state, row: newRow };
    }
    case "SET_COLUMN": {
      const newColumn = action.payload;

      if (newColumn === state.row) {
        return state;
      }

      if (newColumn === state.secondaryColumn) {
        return { ...state, column: newColumn, secondaryColumn: null };
      }
      return { ...state, column: newColumn };
    }
    case "SET_SECONDARY_COLUMN": {
      const newSecondary = action.payload;

      if (newSecondary === state.row || newSecondary === state.column) {
        return state;
      }
      return { ...state, secondaryColumn: newSecondary };
    }
    default:
      return state;
  }
};

const getInitialState = (): GroupingState => {
  const params = new URLSearchParams(window.location.search);
  const row = params.get("row") as GroupingField | null;
  const column = params.get("column") as GroupingField | null;
  const secondaryColumn = params.get("secondaryColumn") as GroupingField | null;

  return {
    row: row ?? "year",
    column: column ?? "status",
    secondaryColumn: secondaryColumn,
  };
};

export const useGroupings = () => {
  const [groupings, dispatch] = useReducer(
    groupingReducer,
    undefined,
    getInitialState,
  );

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("row", groupings.row);
    params.set("column", groupings.column);
    if (groupings.secondaryColumn) {
      params.set("secondaryColumn", groupings.secondaryColumn);
    }

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [groupings]);

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
