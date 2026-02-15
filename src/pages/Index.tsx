import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles } from 'lucide-react';
import { MOCK_FLIPS } from '@/lib/mock-data';
import FlipCard from '@/components/FlipCard';
import CreateFlipModal from '@/components/CreateFlipModal';

const Index = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  const filtered = MOCK_FLIPS.filter((f) => {
    if (filter === 'active') return !f.resolved;
    if (filter === 'resolved') return f.resolved;
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Predict. Stake. Win.
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gradient-green">Yes</span>{' '}
              <span className="text-foreground">or</span>{' '}
              <span className="text-no">No</span>
              <span className="text-foreground">?</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
              Stake STX on binary outcomes. Winners split the pool. Fully on-chain on Stacks.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Flips */}
      <section className="container mx-auto px-4 py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-gold" />
            <h2 className="font-display text-2xl font-bold">Prediction Flips</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-border bg-secondary p-1">
              {(['all', 'active', 'resolved'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors ${
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <CreateFlipModal />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((flip, i) => (
            <FlipCard key={flip.id} flip={flip} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            No flips found for this filter.
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
