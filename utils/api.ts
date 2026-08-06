// utils/api.ts
import type { ExchangeRatesResponse } from './types';

const BASE_URL = 'https://api.frankfurter.app';

/**
 * Fetches the latest exchange rates for display purposes (page subtitle).
 * Revalidates every 24 hours — this is only used for cosmetic metadata (base currency name).
 * The actual live conversion is handled by the /api/convert Route Handler.
 */
export async function getExchangeRates(
  baseCurrency: string = 'USD'
): Promise<ExchangeRatesResponse> {
  const res = await fetch(`${BASE_URL}/latest?base=${baseCurrency}`, {
    // 24-hour revalidation is acceptable here: this fetch is only used to
    // display the base currency name in the page subtitle, not for calculations.
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch exchange rates: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<ExchangeRatesResponse>;
}
