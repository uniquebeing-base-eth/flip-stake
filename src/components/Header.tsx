import { useWallet } from '@/contexts/WalletContext';
import { useStxPrice } from '@/hooks/useStxPrice';
import logo from '@/assets/logo.png';
import { Loader2, Wallet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';


const Header = () => {
  const { connected, stxAddress, connect, disconnect, loading } = useWallet();
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

          {/* Wallet */}
          {connected ? (
            <div className="flex items-center gap-2">
              {stxAddress && (
                <span className="hidden rounded-lg bg-secondary px-3 py-1.5 text-sm font-mono text-foreground sm:inline-block">
                  {truncateAddr(stxAddress)}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={disconnect} className="gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </div>
          ) : (
            <Button onClick={connect} disabled={loading} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
