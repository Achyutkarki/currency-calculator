"use client";

import { useState, useEffect } from 'react';

interface ConverterProps {
  currencyNames: Record<string, string>;
}

export default function Converter({ currencyNames }: ConverterProps) {
  const [amount, setAmount] = useState<string>('1');
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [targetCurrency, setTargetCurrency] = useState<string>('EUR');

  const [convertedAmount, setConvertedAmount] = useState<string>('0.00');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Since we no longer receive 'rates' as a prop, we use the predefined currency mapping
  const availableCurrencies = Object.keys(currencyNames).sort();

  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount)) {
      setConvertedAmount('0.00');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/convert?base=${baseCurrency}&target=${targetCurrency}&amount=${numAmount}`
        );
        const data = await res.json();

        if (!res.ok) {
          console.error('Conversion error:', data.error);
          setConvertedAmount('Error');
          return;
        }

        // Prefer convertedAmount; fall back to result for backwards compatibility
        // Prefer convertedAmount; fall back to result for backwards compatibility
        const value = data.convertedAmount ?? data.result;

        if (value !== undefined) {
          const numValue = Number(value);

          // Dynamic precision: show 4 decimals for tiny amounts, otherwise 2
          if (numValue > 0 && numValue < 1) {
            setConvertedAmount(numValue.toFixed(4));
          } else {
            setConvertedAmount(numValue.toFixed(2));
          }
        } else {
          setConvertedAmount('Error');
        }
      } catch (error) {
        console.error('Failed to fetch conversion:', error);
        setConvertedAmount('Error');
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [amount, baseCurrency, targetCurrency]);

  const handleSwap = () => {
    setBaseCurrency(targetCurrency);
    setTargetCurrency(baseCurrency);
  };

  return (
    <div className="converter-card">
      <div className="input-group">
        <label htmlFor="amount-input">Amount</label>
        <input
          id="amount-input"
          type="number"
          value={amount}
          onChange={(e) => {
            // Sanitize string to remove leading zeros
            const val = e.target.value.replace(/^0+(?=\d)/, '');
            setAmount(val);
          }}
          min="0"
          step="any"
          className="amount-input"
        />
      </div>

      <div className="currency-controls">
        <div className="input-group">
          <label htmlFor="base-currency">From</label>
          <select
            id="base-currency"
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="currency-select"
          >
            {availableCurrencies.map(code => (
              <option key={code} value={code}>
                {currencyNames[code]} ({code})
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleSwap} className="swap-button" aria-label="Swap currencies">
          Swap
        </button>

        <div className="input-group">
          <label htmlFor="target-currency">To</label>
          <select
            id="target-currency"
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
            className="currency-select"
          >
            {availableCurrencies.map(code => (
              <option key={code} value={code}>
                {currencyNames[code]} ({code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="result-group">
        <h2
          className="result-display"
          style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s ease' }}
        >
          {amount || '0'} {baseCurrency} = {isLoading ? '...' : convertedAmount} {targetCurrency}
        </h2>
      </div>
    </div>
  );
}
