import { motion } from 'framer-motion';

interface PoolBarProps {
  yesAmount: number;
  noAmount: number;
}

const PoolBar = ({ yesAmount, noAmount }: PoolBarProps) => {
  const total = yesAmount + noAmount;
  const yesPct = total > 0 ? (yesAmount / total) * 100 : 50;
  const noPct = total > 0 ? (noAmount / total) * 100 : 50;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-yes">YES {yesPct.toFixed(0)}%</span>
        <span className="text-no">NO {noPct.toFixed(0)}%</span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full bg-yes"
          initial={{ width: 0 }}
          animate={{ width: `${yesPct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.div
          className="h-full bg-no"
          initial={{ width: 0 }}
          animate={{ width: `${noPct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{yesAmount.toLocaleString()} STX</span>
        <span>{noAmount.toLocaleString()} STX</span>
      </div>
    </div>
  );
};

export default PoolBar;
