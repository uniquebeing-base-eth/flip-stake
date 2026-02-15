import { useState, useEffect } from 'react';


export interface PricePoint {
  timestamp: number;
  price: number;
}

type TimeRange = '1D' | '7D' | '30D' | '90D';

const RANGE_DAYS: Record<TimeRange, number> = {
  '1D': 1,
  '7D': 7,
  '30D': 30,
  '90D': 90,
};

async function fetchFromCoinGecko(days: number): Promise<PricePoint[] | null> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/blockstack/market_chart?vs_currency=usd&days=${days}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.prices as [number, number][]).map(([t, p]) => ({ timestamp: t, price: p }));
  } catch {
    return null;
  }
}

async function fetchFromCoinCap(days: number): Promise<PricePoint[] | null> {
  try {
    const interval = days <= 1 ? 'h1' : days <= 7 ? 'h6' : 'd1';
    const start = Date.now() - days * 86400000;
    const res = await fetch(
      `https://api.coincap.io/v2/assets/stacks/history?interval=${interval}&start=${start}&end=${Date.now()}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.data as any[]).map((d) => ({
      timestamp: new Date(d.date).getTime(),
      price: parseFloat(d.priceUsd),
    }));
  } catch {
    return null;
  }
}

async function fetchFromCryptoCompare(days: number): Promise<PricePoint[] | null> {
  try {
    const limit = Math.min(days <= 1 ? 24 : days, 2000);
    const endpoint = days <= 1 ? 'histohour' : 'histoday';
    const res = await fetch(
      `https://min-api.cryptocompare.com/data/v2/${endpoint}?fsym=STX&tsym=USD&limit=${limit}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.Data?.Data as any[])?.map((d: any) => ({
      timestamp: d.time * 1000,
      price: d.close,
    })) ?? null;
  } catch {
    return null;
  }
}

export function useStxChart(range: TimeRange = '7D') {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const days = RANGE_DAYS[range];

    (async () => {
      let points = await fetchFromCoinGecko(days);
      if (!points) points = await fetchFromCoinCap(days);
      if (!points) points = await fetchFromCryptoCompare(days);
      if (!cancelled) {
        setData(points ?? []);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [range]);

  return { data, loading };
}

export type { TimeRange };
