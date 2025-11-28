import { test, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";
import App from "./App";

import "@testing-library/jest-dom";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  window.history.replaceState(null, "", window.location.pathname);
});
afterAll(() => server.close());

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
};

test("displays loading state initially", () => {
  renderApp();
  expect(screen.getByText("Loading...")).toBeInTheDocument();
});

test("renders transaction table after data loads", async () => {
  renderApp();

  await waitFor(() => {
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  expect(screen.getByRole("table")).toBeInTheDocument();
});

test("displays row grouping selector", async () => {
  renderApp();

  await waitFor(() => {
    expect(screen.getByLabelText("Row grouping")).toBeInTheDocument();
  });

  const select = screen.getByLabelText("Row grouping");
  expect(select).toHaveValue("year");
});

test("displays column grouping selector", async () => {
  renderApp();

  await waitFor(() => {
    expect(screen.getByLabelText("Column grouping")).toBeInTheDocument();
  });

  const select = screen.getByLabelText("Column grouping");
  expect(select).toHaveValue("status");
});

test("displays secondary column grouping selector", async () => {
  renderApp();

  await waitFor(() => {
    expect(
      screen.getByLabelText("Secondary column grouping"),
    ).toBeInTheDocument();
  });

  const select = screen.getByLabelText("Secondary column grouping");
  expect(select).toHaveValue("");
});

test("changes row grouping when user selects different option", async () => {
  renderApp();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(screen.getByLabelText("Row grouping")).toBeInTheDocument();
  });

  const select = screen.getByLabelText("Row grouping");
  await user.selectOptions(select, "transaction_type");

  expect(select).toHaveValue("transaction_type");
});

test("changes column grouping when user selects different option", async () => {
  renderApp();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(screen.getByLabelText("Column grouping")).toBeInTheDocument();
  });

  const select = screen.getByLabelText("Column grouping");
  await user.selectOptions(select, "transaction_type");

  expect(select).toHaveValue("transaction_type");
});

test("changes secondary column grouping when user selects option", async () => {
  renderApp();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(
      screen.getByLabelText("Secondary column grouping"),
    ).toBeInTheDocument();
  });

  const select = screen.getByLabelText("Secondary column grouping");
  await user.selectOptions(select, "transaction_type");

  expect(select).toHaveValue("transaction_type");
});

test("displays table with correct structure for single-level columns", async () => {
  renderApp();

  await waitFor(() => {
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  const table = screen.getByRole("table");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  const tfoot = table.querySelector("tfoot");

  expect(thead).toBeInTheDocument();
  expect(tbody).toBeInTheDocument();
  expect(tfoot).toBeInTheDocument();
});

test("displays table with two-level headers when secondary column is set", async () => {
  renderApp();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(
      screen.getByLabelText("Secondary column grouping"),
    ).toBeInTheDocument();
  });

  const select = screen.getByLabelText("Secondary column grouping");
  await user.selectOptions(select, "transaction_type");

  await waitFor(() => {
    const table = screen.getByRole("table");
    const thead = table.querySelector("thead");
    const headerRows = thead?.querySelectorAll("tr");
    expect(headerRows?.length).toBe(2);
  });
});

test("displays column totals in footer", async () => {
  renderApp();

  await waitFor(() => {
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  const table = screen.getByRole("table");
  const tfoot = table.querySelector("tfoot");
  const totalRow = tfoot?.querySelector("tr");
  const totalHeader = totalRow?.querySelector("th");

  expect(totalHeader?.textContent).toBe("Total");
});

test("formats amounts with currency symbol", async () => {
  renderApp();

  await waitFor(() => {
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  const currencySymbols = screen.getAllByText("$");
  expect(currencySymbols.length).toBeGreaterThan(0);
});

test("displays distinct values for transaction_type, status, and year", async () => {
  renderApp();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  const rowSelect = screen.getByLabelText("Row grouping");
  await user.selectOptions(rowSelect, "transaction_type");

  await waitFor(() => {
    const table = screen.getByRole("table");
    const tbody = table.querySelector("tbody");
    const rows = tbody?.querySelectorAll("tr");
    expect(rows && rows.length > 0).toBe(true);
  });
});

test("updates table when grouping configuration changes", async () => {
  renderApp();
  const user = userEvent.setup();

  await waitFor(() => {
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  const initialTable = screen.getByRole("table").innerHTML;

  const rowSelect = screen.getByLabelText("Row grouping");
  await user.selectOptions(rowSelect, "status");

  await waitFor(() => {
    const updatedTable = screen.getByRole("table").innerHTML;
    expect(updatedTable).not.toBe(initialTable);
  });
});
