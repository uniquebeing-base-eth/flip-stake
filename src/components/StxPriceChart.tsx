import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useStxChart, type TimeRange } from '@/hooks/useStxChart';
import { useStxPrice } from '@/hooks/useStxPrice';

const RANGES: TimeRange[] = ['1D', '7D', '30D', '90D'];

const StxPriceChart = () => {
  const [range, setRange] = useState<TimeRange>('7D');
  const { data, loading } = useStxChart(range);
  const { price } = useStxPrice();

  const chartData = useMemo(
    () => data.map((p) => ({ time: p.timestamp, price: p.price })),
    [data]
  );

  const priceChange = useMemo(() => {
    if (chartData.length < 2) return 0;
    const first = chartData[0].price;
    const last = chartData[chartData.length - 1].price;
    return ((last - first) / first) * 100;
  }, [chartData]);

  const isPositive = priceChange >= 0;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    if (range === '1D') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold">STX Price</h3>
            <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isPositive ? 'bg-yes/10 text-yes' : 'bg-no/10 text-no'
            }`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
          <p className="font-display text-2xl font-bold">
            {price ? `$${price.toFixed(4)}` : '—'}
          </p>
        </div>
        <div className="flex rounded-lg border border-border bg-secondary p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Loading chart…
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="stxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? 'hsl(142,60%,45%)' : 'hsl(0,70%,55%)'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? 'hsl(142,60%,45%)' : 'hsl(0,70%,55%)'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tickFormatter={formatTime}
                stroke="hsl(220,10%,30%)"
                tick={{ fontSize: 10, fill: 'hsl(220,10%,55%)' }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={['auto', 'auto']}
                stroke="hsl(220,10%,30%)"
                tick={{ fontSize: 10, fill: 'hsl(220,10%,55%)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v.toFixed(2)}`}
                width={55}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(220,18%,10%)',
                  border: '1px solid hsl(220,15%,18%)',
                  borderRadius: '8px',
                  fontSize: 12,
                  color: 'hsl(60,10%,92%)',
                }}
                labelFormatter={(v) => new Date(v).toLocaleString()}
                formatter={(value: number) => [`$${value.toFixed(4)}`, 'STX']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? 'hsl(142,60%,45%)' : 'hsl(0,70%,55%)'}
                strokeWidth={2}
                fill="url(#stxGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

export default StxPriceChart;
