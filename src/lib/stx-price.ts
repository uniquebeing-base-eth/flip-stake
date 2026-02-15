
const APIS = [
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd',
    extract: (data: any) => data?.blockstack?.usd,
  },
  {
    name: 'CoinCap',
    url: 'https://api.coincap.io/v2/assets/stacks',
    extract: (data: any) => parseFloat(data?.data?.priceUsd),
  },
  {
    name: 'CryptoCompare',
    url: 'https://min-api.cryptocompare.com/data/price?fsym=STX&tsyms=USD',
    extract: (data: any) => data?.USD,
  },
];

export async function fetchStxPrice(): Promise<number | null> {
  for (const api of APIS) {
    try {
      const res = await fetch(api.url);
      if (!res.ok) continue;
      const data = await res.json();
      const price = api.extract(data);
      if (typeof price === 'number' && !isNaN(price)) return price;
    } catch {
      continue;
    }
  }
  return null;
}
