import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// INR <-> NPR peg: 1 INR = 1.6 NPR (fixed regional peg, bypasses all API math)
const INR_NPR_PEG = 1.6;

/**
 * Rounds a number to a sensible precision (max 8 significant digits)
 * to eliminate JavaScript floating-point artifacts like 134.5000000000003.
 */
function roundToPrecision(value: number, precision: number = 8): number {
  return parseFloat(value.toPrecision(precision));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get('base')?.toUpperCase().trim();
    const target = searchParams.get('target')?.toUpperCase().trim();
    const amountParam = searchParams.get('amount');

    if (!base || !target) {
      return NextResponse.json(
        { error: 'Missing required parameters: base, target' },
        { status: 400 }
      );
    }

    let amount = parseFloat(amountParam ?? '1');
    if (!isFinite(amount) || isNaN(amount) || amount < 0) {
      amount = 1;
    }

    // ── CASE 1: Regional Peg (INR ↔ NPR) ─────────────────────────────────────
    // Structurally isolated — never touches the external API or cross-rate math.
    if (base === 'INR' && target === 'NPR') {
      const convertedAmount = roundToPrecision(amount * INR_NPR_PEG);
      return NextResponse.json({
        convertedAmount,
        result: convertedAmount,
        meta: { type: 'pegged', peg: `1 INR = ${INR_NPR_PEG} NPR` },
      });
    }
    if (base === 'NPR' && target === 'INR') {
      const convertedAmount = roundToPrecision(amount / INR_NPR_PEG);
      return NextResponse.json({
        convertedAmount,
        result: convertedAmount,
        meta: { type: 'pegged', peg: `${INR_NPR_PEG} NPR = 1 INR` },
      });
    }

    // ── CASE 2: Same-currency identity ────────────────────────────────────────
    if (base === target) {
      return NextResponse.json({ convertedAmount: amount, result: amount });
    }

    // ── CASE 3: General cross-conversion via live external API ────────────────
    const apiRes = await fetch('https://open.er-api.com/v6/latest/USD', {
      cache: 'no-store', // Always fetch fresh rates — never serve stale data
    });

    if (!apiRes.ok) {
      throw new Error(
        `External API responded with ${apiRes.status}: ${apiRes.statusText}`
      );
    }

    const data: {
      result: string;
      time_last_update_utc: string;
      time_next_update_utc: string;
      base_code: string;
      rates: Record<string, number>;
    } = await apiRes.json();

    if (data.result !== 'success' || !data.rates) {
      throw new Error('External API returned an unexpected payload structure');
    }

    const rates = data.rates;
    const baseRate = rates[base];
    const targetRate = rates[target];

    if (baseRate === undefined) {
      return NextResponse.json(
        { error: `Unsupported base currency: ${base}` },
        { status: 400 }
      );
    }
    if (targetRate === undefined) {
      return NextResponse.json(
        { error: `Unsupported target currency: ${target}` },
        { status: 400 }
      );
    }

    // Cross-conversion: USD-normalised formula eliminates cascading float errors
    // (amount ÷ baseRate) gives USD equivalent, then × targetRate gives final value
    const rawConverted = (amount / baseRate) * targetRate;
    const convertedAmount = roundToPrecision(rawConverted);

    return NextResponse.json({
      convertedAmount,
      result: convertedAmount,
      meta: {
        base,
        target,
        rate: roundToPrecision(targetRate / baseRate),
        time_last_update_utc: data.time_last_update_utc,
        time_next_update_utc: data.time_next_update_utc,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[/api/convert] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
