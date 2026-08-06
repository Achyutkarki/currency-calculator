// utilis/currencies.ts

export const CURRENCY_NAMES: Record<string, string> = {
    USD: "US Dollar",
    EUR: "Euro",
    GBP: "British Pound",
    AUD: "Australian Dollar",
    CAD: "Canadian Dollar",
    JPY: "Japanese Yen",
    INR: "Indian Rupee",
    BRL: "Brazilian Real",
    CNY: "Chinese Yuan",
    CHF: "Swiss Franc",
    NPR: "Nepalese Rupee",
    NZD: "New Zealand Dollar",
    SGD: "Singapore Dollar",
    SEK: "Swedish Krona",
    ZAR: "South African Rand",
    AED: "United Arab Emirates Dirham",
    MYR: "Malaysian Ringgit",
    TRY: "Turkish Lira",
    // Feel free to add more based on the JSON you see in your browser!
};

// A helper function to safely get a name, falling back to the code if not found
export function getCurrencyName(code: string): string {
    return CURRENCY_NAMES[code] || code;
}