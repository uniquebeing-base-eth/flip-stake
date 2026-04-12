import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { connectWallet, disconnectWallet, getWalletState, signMessage, type WalletState } from '@/lib/wallet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SignalifyUser {
  id: string;
  username?: string;
  wallet_address?: string;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  loading: boolean;
  authenticated: boolean;
  user: SignalifyUser | null;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  stxAddress: null,
  connect: async () => {},
  disconnect: () => {},
  loading: false,
  authenticated: false,
  user: null,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>({ connected: false, stxAddress: null });
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<SignalifyUser | null>(null);
  const { toast } = useToast();

  // Check existing session on mount
  useEffect(() => {
    const ws = getWalletState();
    setState(ws);

    // Check if we already have a Supabase session (from Signalify)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthenticated(true);
        const meta = session.user?.user_metadata;
        setUser({
          id: session.user.id,
          username: meta?.username,
          wallet_address: meta?.wallet_address,
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthenticated(true);
        const meta = session.user?.user_metadata;
        setUser({
          id: session.user.id,
          username: meta?.username,
          wallet_address: meta?.wallet_address,
        });
      } else {
        setAuthenticated(false);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleConnect = useCallback(async () => {
    setLoading(true);
    try {
      // Step 1: Connect wallet
      const ws = await connectWallet();
      setState(ws);

      if (!ws.stxAddress) {
        throw new Error('No STX address found');
      }

      // Step 2: Sign message for Signalify auth
      const authMessage = `Welcome to StackFlip!\nSign this message to verify your wallet ownership.\nAddress: ${ws.stxAddress}\nTimestamp: ${Date.now()}`;
      
      const { signature } = await signMessage(authMessage);

      // Step 3: Authenticate via Signalify edge function
      const { data, error } = await supabase.functions.invoke('signalify-auth', {
        body: {
          address: ws.stxAddress,
          signature,
          message: authMessage,
        },
      });

      if (error) {
        throw new Error(error.message || 'Authentication failed');
      }

      // Step 4: Set the Supabase session with Signalify tokens
      if (data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        toast({
          title: 'Authenticated',
          description: `Signed in as ${data.user?.user_metadata?.username || ws.stxAddress.slice(0, 8) + '…'}`,
        });
      }
    } catch (e: any) {
      console.error('Wallet connection/auth failed:', e);
      toast({
        title: 'Connection failed',
        description: e?.message || 'Could not connect wallet',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleDisconnect = useCallback(async () => {
    disconnectWallet();
    await supabase.auth.signOut();
    setState({ connected: false, stxAddress: null });
    setAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect: handleConnect,
        disconnect: handleDisconnect,
        loading,
        authenticated,
        user,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
