
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { connectWallet, disconnectWallet, getWalletState, type WalletState } from '@/lib/wallet';

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  stxAddress: null,
  connect: async () => {},
  disconnect: () => {},
  loading: false,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>({ connected: false, stxAddress: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ws = getWalletState();
    setState(ws);
  }, []);

  const handleConnect = useCallback(async () => {
    setLoading(true);
    try {
      const ws = await connectWallet();
      setState(ws);
    } catch (e) {
      console.error('Wallet connection failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    disconnectWallet();
    setState({ connected: false, stxAddress: null });
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, connect: handleConnect, disconnect: handleDisconnect, loading }}>
      {children}
    </WalletContext.Provider>
  );
};
