import { http, HttpResponse, delay } from "msw";
import transactionsData from "./transactions.json";

export const handlers = [
  http.get("/transactions", async () => {
    await delay();
    return HttpResponse.json(transactionsData);
  }),
];
