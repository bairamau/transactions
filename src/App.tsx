import { useQuery } from "@tanstack/react-query";
import { transactionsService } from "@/services/transactions";
import { getAggregations } from "@/utils/aggregations";
import { useGroupings, type GroupingField } from "@/hooks/useGroupings";
import { formatAmount } from "@/utils/format";

import "./App.css";

function App() {
  const {
    groupings,
    dispatch,
    availableColumnFields,
    availableSecondaryColumnFields,
    rowFields,
  } = useGroupings();

  const query = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionsService.list,
  });

  const aggregatedData = query.data
    ? getAggregations(
        query.data,
        groupings.row,
        groupings.column,
        groupings.secondaryColumn ?? undefined,
      )
    : null;

  if (query.isLoading) return <main>Loading...</main>;
  if (query.isError) return <main>Could not fetch the data</main>;

  return (
    <main>
      <label>
        Row grouping
        <select
          value={groupings.row}
          onChange={(e) =>
            dispatch({
              type: "SET_ROW",
              payload: e.target.value as GroupingField,
            })
          }
        >
          {rowFields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </label>

      <label>
        Column grouping
        <select
          value={groupings.column}
          onChange={(e) =>
            dispatch({
              type: "SET_COLUMN",
              payload: e.target.value as GroupingField,
            })
          }
        >
          {availableColumnFields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </label>

      <label>
        Secondary column grouping
        <select
          value={groupings.secondaryColumn ?? ""}
          onChange={(e) =>
            dispatch({
              type: "SET_SECONDARY_COLUMN",
              payload:
                e.target.value === ""
                  ? null
                  : (e.target.value as GroupingField),
            })
          }
        >
          <option value="">--</option>
          {availableSecondaryColumnFields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </label>

      {aggregatedData && (
        <table>
          <thead>
            {aggregatedData.secondaryColumnValues ? (
              // Two-level headers
              <>
                <tr>
                  <th scope="col" rowSpan={2}></th>
                  {aggregatedData.primaryColumnValues.map((primary) => (
                    <th
                      scope="col"
                      colSpan={aggregatedData.secondaryColumnValues!.length}
                      key={primary}
                    >
                      {primary}
                    </th>
                  ))}
                </tr>
                <tr>
                  {aggregatedData.primaryColumnValues.map((primary) =>
                    aggregatedData.secondaryColumnValues!.map((secondary) => (
                      <th scope="col" key={`${primary}|${secondary}`}>
                        {secondary}
                      </th>
                    )),
                  )}
                </tr>
              </>
            ) : (
              // Single-level header
              <tr>
                <th scope="col"></th>
                {aggregatedData.columnValues.map((col) => (
                  <th scope="col" key={col.key}>
                    {col.primary}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {aggregatedData.rowValues.map((rowVal) => (
              <tr key={rowVal}>
                <th
                  scope="row"
                  className={groupings.row === "year" ? "row-numeric" : ""}
                >
                  {rowVal}
                </th>
                {aggregatedData.columnValues.map((col) => (
                  <td key={col.key}>
                    <span className="currency">$</span>
                    <span className="amount">
                      {formatAmount(aggregatedData.cells[rowVal][col.key])}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              {aggregatedData.columnValues.map((col) => (
                <td key={col.key}>
                  <span className="currency">$</span>
                  <span className="amount">
                    {formatAmount(aggregatedData.columnTotals[col.key])}
                  </span>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      )}
    </main>
  );
}

export default App;
