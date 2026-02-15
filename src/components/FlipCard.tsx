import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Trophy, TrendingUp } from 'lucide-react';
import type { Flip } from '@/lib/mock-data';
import { CURRENT_BLOCK } from '@/lib/mock-data';
import PoolBar from './PoolBar';

interface FlipCardProps {
  flip: Flip;
  index: number;
}

const FlipCard = ({ flip, index }: FlipCardProps) => {
  const blocksLeft = flip.deadline - CURRENT_BLOCK;
  const isActive = blocksLeft > 0 && !flip.resolved;
  const totalPool = flip.totalYesStake + flip.totalNoStake;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/flip/${flip.id}`} className="block">
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:glow-green">
          {/* Status badge */}
          <div className="mb-3 flex items-center justify-between">
            {isActive ? (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
                Active
              </span>
            ) : flip.resolved ? (
              <span className="flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold">
                <Trophy className="h-3 w-3" />
                Resolved — {flip.winningSide ? 'YES' : 'NO'}
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                Ended
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {totalPool.toLocaleString()} STX
            </div>
          </div>

          {/* Question */}
          <h3 className="mb-4 font-display text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
            {flip.question}
          </h3>

          {/* Pool bar */}
          <PoolBar yesAmount={flip.totalYesStake} noAmount={flip.totalNoStake} />

          {/* Time remaining */}
          {isActive && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              ~{blocksLeft.toLocaleString()} blocks remaining
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default FlipCard;
