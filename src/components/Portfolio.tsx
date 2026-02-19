
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Gift, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/contexts/WalletContext';
import { getUserActiveStakes, getUserPastWins, getClaimableRewards } from '@/lib/mock-portfolio';
import { toast } from 'sonner';

const Portfolio = () => {
  const { connected, connect } = useWallet();

  if (!connected) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Wallet className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-4">Connect your wallet to view your portfolio</p>
        <Button onClick={connect} className="gap-2">
          <Wallet className="h-4 w-4" /> Connect Wallet
        </Button>
      </div>
    );
  }

  const active = getUserActiveStakes();
  const wins = getUserPastWins();
  const claimable = getClaimableRewards();
  const totalClaimable = claimable.reduce((sum, s) => sum + s.claimable, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Summary strip */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Active Stakes', value: active.length, icon: TrendingUp, color: 'text-primary' },
          { label: 'Past Wins', value: wins.length, icon: Trophy, color: 'text-gold' },
          { label: 'Claimable', value: `${totalClaimable} STX`, icon: Gift, color: 'text-yes' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4 text-center">
            <s.icon className={`mx-auto mb-1 h-5 w-5 ${s.color}`} />
            <p className="font-display text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="active" className="flex-1">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="wins" className="flex-1">Wins ({wins.length})</TabsTrigger>
          <TabsTrigger value="claimable" className="flex-1">Claimable ({claimable.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {active.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground text-sm">No active stakes</p>
          ) : (
            <div className="space-y-2 mt-2">
              {active.map((s) => (
                <Link key={s.flipId} to={`/flip/${s.flipId}`} className="block">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3 hover:border-primary/40 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.flip.question}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Staked <span className={s.side === 'yes' ? 'text-yes' : 'text-no'}>{s.side.toUpperCase()}</span>
                      </p>
                    </div>
                    <span className="ml-3 font-display font-bold text-sm">{s.amount} STX</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wins">
          {wins.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground text-sm">No wins yet</p>
          ) : (
            <div className="space-y-2 mt-2">
              {wins.map((s) => (
                <Link key={s.flipId} to={`/flip/${s.flipId}`} className="block">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.flip.question}</p>
                      <p className="text-xs text-gold mt-0.5 flex items-center gap-1">
                        <Trophy className="h-3 w-3" /> Won on {s.side.toUpperCase()}
                      </p>
                    </div>
                    <span className="ml-3 font-display font-bold text-sm text-gold">{s.amount} STX</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claimable">
          {claimable.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground text-sm">Nothing to claim</p>
          ) : (
            <div className="space-y-2 mt-2">
              {claimable.map((s) => (
                <div key={s.flipId} className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.flip.question}</p>
                    <p className="text-xs text-yes mt-0.5">{s.claimable} STX claimable</p>
                  </div>
                  <Button
                    size="sm"
                    className="ml-3 bg-gold text-gold-foreground hover:bg-gold/90"
                    onClick={() => toast.success(`Claimed ${s.claimable} STX! (demo)`)}
                  >
                    <Gift className="mr-1 h-3 w-3" /> Claim
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Portfolio;
