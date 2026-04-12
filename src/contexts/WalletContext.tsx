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
  signInWithSignalify: () => Promise<void>;
  disconnect: () => void;
  loading: boolean;
  signingIn: boolean;
  authenticated: boolean;
  user: SignalifyUser | null;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  stxAddress: null,
  connect: async () => {},
  signInWithSignalify: async () => {},
  disconnect: () => {},
  loading: false,
  signingIn: false,
  authenticated: false,
  user: null,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>({ connected: false, stxAddress: null });
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<SignalifyUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const ws = getWalletState();
    setState(ws);

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

  // Primary: just connect wallet, no Signalify auth
  const handleConnect = useCallback(async () => {
    setLoading(true);
    try {
      const ws = await connectWallet();
      setState(ws);
      if (!ws.stxAddress) {
        throw new Error('No STX address found');
      }
      toast({
        title: 'Wallet connected',
        description: `Connected as ${ws.stxAddress.slice(0, 6)}…${ws.stxAddress.slice(-4)}`,
      });
    } catch (e: any) {
      console.error('Wallet connection failed:', e);
      toast({
        title: 'Connection failed',
        description: e?.message || 'Could not connect wallet',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Secondary: connect wallet + authenticate via Signalify
  const handleSignInWithSignalify = useCallback(async () => {
    setSigningIn(true);
    try {
      // Ensure wallet is connected first
      let ws = state;
      if (!state.connected || !state.stxAddress) {
        ws = await connectWallet();
        setState(ws);
      }

      if (!ws.stxAddress) {
        throw new Error('No STX address found');
      }

      const authMessage = `Welcome to StackFlip!\nSign this message to verify your wallet ownership.\nAddress: ${ws.stxAddress}\nTimestamp: ${Date.now()}`;
      const { signature } = await signMessage(authMessage);

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
      console.error('Signalify sign-in failed:', e);
      toast({
        title: 'Sign in failed',
        description: e?.message || 'Could not sign in with Signalify',
        variant: 'destructive',
      });
    } finally {
      setSigningIn(false);
    }
  }, [toast, state]);

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
        signInWithSignalify: handleSignInWithSignalify,
        disconnect: handleDisconnect,
        loading,
        signingIn,
        authenticated,
        user,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
