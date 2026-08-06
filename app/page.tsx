import { Metadata } from 'next';
import { getExchangeRates } from '@/utils/api';
import { getCurrencyName, CURRENCY_NAMES } from '@/utils/currencies';
import Converter from '@/components/Converter';

export const metadata: Metadata = {
  title: 'Free Currency Converter | Live Exchange Rates',
  description: 'Fast and free currency converter with live exchange rates. Convert USD, EUR, GBP, JPY, and more in real-time without refreshing.',
  keywords: 'currency converter, exchange rates, live currency, foreign exchange, forex calculator, USD, EUR, GBP, JPY',
};

export default async function Home() {
  const ratesData = await getExchangeRates("USD");

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Currency Converter',
    description: 'A fast and free currency converter with real-time exchange rates.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <main>
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <h1>Currency Converter</h1>
      <p className="subtitle">
        Base: {getCurrencyName(ratesData.base)} ({ratesData.base})
      </p>

      <Converter currencyNames={CURRENCY_NAMES} />
    </main>
  );
}