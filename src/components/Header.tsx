
import { useWallet } from '@/contexts/WalletContext';
import { useStxPrice } from '@/hooks/useStxPrice';
import logo from '@/assets/logo.png';
import signalifyIcon from '@/assets/signalify-icon.png';
import { Loader2, LogOut, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';


const Header = () => {
  const { connected, stxAddress, connect, signInWithSignalify, disconnect, loading, signingIn, authenticated, user } = useWallet();
  const { price, loading: priceLoading } = useStxPrice();

  const truncateAddr = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2">
          <img src={logo} alt="StackFlip" className="h-10 w-auto" />
        </a>

        <div className="flex items-center gap-4">
          {/* STX Price */}
          <div className="hidden items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium sm:flex">
            <span className="text-muted-foreground">STX</span>
            <span className="text-foreground">
              {priceLoading ? '…' : price ? `$${price.toFixed(2)}` : 'N/A'}
            </span>
          </div>

          {/* Auth State */}
          {connected ? (
            <div className="flex items-center gap-2">
              {(user?.username || stxAddress) && (
                <span className="hidden rounded-lg bg-secondary px-3 py-1.5 text-sm font-mono text-foreground sm:inline-block">
                  {user?.username ? `@${user.username}` : stxAddress ? truncateAddr(stxAddress) : ''}
                </span>
              )}
              {authenticated && (
                <span className="hidden rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent-foreground sm:inline-block">
                  Verified
                </span>
              )}
              {/* If wallet connected but not Signalify-authenticated, offer sign-in */}
              {!authenticated && (
                <Button
                  onClick={signInWithSignalify}
                  disabled={signingIn}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  {signingIn ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <img src={signalifyIcon} alt="" className="h-4 w-4" loading="lazy" width={16} height={16} />
                  )}
                  <span className="hidden sm:inline">Sign in</span>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={disconnect} className="gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Primary: Connect Wallet */}
              <Button
                onClick={connect}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                Connect Wallet
              </Button>
              {/* Secondary: Sign in with Signalify */}
              <Button
                onClick={signInWithSignalify}
                disabled={signingIn}
                variant="outline"
                className="gap-2"
              >
                {signingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <img src={signalifyIcon} alt="" className="h-5 w-5" loading="lazy" width={20} height={20} />
                )}
                <span className="hidden sm:inline">Sign in with Signalify</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
