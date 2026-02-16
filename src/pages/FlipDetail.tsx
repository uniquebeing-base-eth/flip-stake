import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Clock, CheckCircle, XCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MOCK_FLIPS, CURRENT_BLOCK } from '@/lib/mock-data';
import { useWallet } from '@/contexts/WalletContext';
import { shareOnTwitter } from '@/lib/share';
import PoolBar from '@/components/PoolBar';
import { toast } from 'sonner';


const FlipDetail = () => {
  const { id } = useParams();
  const flip = MOCK_FLIPS.find((f) => f.id === Number(id));
  const { connected, connect } = useWallet();
  const [amount, setAmount] = useState('');
  const [txState, setTxState] = useState<'idle' | 'confirming' | 'pending' | 'success' | 'failed'>('idle');

  if (!flip) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold">Flip not found</h2>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">← Back to flips</Link>
        </div>
      </div>
    );
  }

  const blocksLeft = flip.deadline - CURRENT_BLOCK;
  const isActive = blocksLeft > 0 && !flip.resolved;
  const totalPool = flip.totalYesStake + flip.totalNoStake;

  const handleStake = async (side: 'yes' | 'no') => {
    if (!connected) { connect(); return; }
    const stakeAmount = parseFloat(amount);
    if (!stakeAmount || stakeAmount <= 0) { toast.error('Enter a valid STX amount'); return; }

    setTxState('confirming');
    // Simulate tx flow
    setTimeout(() => setTxState('pending'), 1000);
    setTimeout(() => {
      setTxState('success');
      toast.success(`Staked ${stakeAmount} STX on ${side.toUpperCase()}! (demo)`);
      setTimeout(() => setTxState('idle'), 2000);
    }, 3000);
  };

  const handleClaim = () => {
    if (!connected) { connect(); return; }
    toast.success('Reward claimed! (demo mode)');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        All Flips
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        {/* Status */}
        <div className="mb-4 flex items-center justify-between">
          {isActive ? (
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
              Active
            </span>
          ) : flip.resolved ? (
            <span className="flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-sm font-semibold text-gold">
              <Trophy className="h-4 w-4" />
              Resolved — {flip.winningSide ? 'YES wins' : 'NO wins'}
            </span>
          ) : (
            <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">Ended</span>
          )}
          {isActive && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> ~{blocksLeft.toLocaleString()} blocks left
            </span>
          )}
        </div>

        {/* Question */}
        <h1 className="font-display text-2xl font-bold leading-snug mb-6">{flip.question}</h1>

        {/* Pool */}
        <div className="mb-2 text-center">
          <span className="text-sm text-muted-foreground">Total Pool</span>
          <p className="font-display text-3xl font-bold text-gradient-gold">{totalPool.toLocaleString()} STX</p>
        </div>

        <div className="mb-6">
          <PoolBar yesAmount={flip.totalYesStake} noAmount={flip.totalNoStake} />
        </div>

        {/* Staking */}
        {isActive && (
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Amount in STX"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary border-border text-center text-lg h-12"
              disabled={txState !== 'idle'}
            />

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleStake('yes')}
                disabled={txState !== 'idle'}
                className="h-14 text-lg font-bold bg-yes text-yes-foreground hover:bg-yes/90 glow-green"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                YES
              </Button>
              <Button
                onClick={() => handleStake('no')}
                disabled={txState !== 'idle'}
                className="h-14 text-lg font-bold bg-no text-no-foreground hover:bg-no/90 glow-red"
              >
                <XCircle className="mr-2 h-5 w-5" />
                NO
              </Button>
            </div>

            {txState !== 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-lg p-3 text-center text-sm font-medium ${
                  txState === 'confirming' ? 'bg-gold/10 text-gold' :
                  txState === 'pending' ? 'bg-primary/10 text-primary' :
                  txState === 'success' ? 'bg-yes/10 text-yes' :
                  'bg-destructive/10 text-destructive'
                }`}
              >
                {txState === 'confirming' && '⏳ Confirm in your wallet…'}
                {txState === 'pending' && '🔄 Transaction pending…'}
                {txState === 'success' && '✅ Stake successful!'}
                {txState === 'failed' && '❌ Transaction failed'}
              </motion.div>
            )}
          </div>
        )}

        {/* Claim */}
        {flip.resolved && (
          <Button onClick={handleClaim} className="w-full h-14 text-lg font-bold bg-gold text-gold-foreground hover:bg-gold/90 glow-gold">
            <Trophy className="mr-2 h-5 w-5" />
            Claim Reward
          </Button>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Created by <span className="font-mono">{flip.creator.slice(0, 8)}…{flip.creator.slice(-4)}</span>
            {' · '}Flip #{flip.id}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-primary"
            onClick={() => shareOnTwitter({ question: flip.question, flipId: flip.id })}
          >
            <Share2 className="h-4 w-4" />
            Share on X
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default FlipDetail;
