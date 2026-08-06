// utils/types.ts

export interface ExchangeRatesResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}
