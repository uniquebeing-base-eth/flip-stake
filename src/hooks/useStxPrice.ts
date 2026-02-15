import { useState, useEffect } from 'react';
import { fetchStxPrice } from '@/lib/stx-price';

export function useStxPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchStxPrice().then((p) => {
      if (!cancelled) {
        setPrice(p);
        setLoading(false);
      }
    });
    const interval = setInterval(async () => {
      const p = await fetchStxPrice();
      if (!cancelled) setPrice(p);
    }, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return { price, loading };
}
