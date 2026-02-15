import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect';

export interface WalletState {
  connected: boolean;
  stxAddress: string | null;
}

export async function connectWallet(): Promise<WalletState> {
  if (isConnected()) {
    const data = getLocalStorage();
    const addresses = data?.addresses;
    const stxAddr = Array.isArray(addresses)
      ? addresses.find((a: any) => a.symbol === 'STX')?.address ?? addresses[0]?.address ?? null
      : null;
    return { connected: true, stxAddress: stxAddr };
  }

  const response = await connect();
  const addresses = response?.addresses;
  const stxAddr = Array.isArray(addresses)
    ? addresses.find((a: any) => a.symbol === 'STX')?.address ?? addresses[0]?.address ?? null
    : null;
  return { connected: true, stxAddress: stxAddr };
}

export function disconnectWallet() {
  disconnect();
}

export function getWalletState(): WalletState {
  const connected = isConnected();
  if (!connected) return { connected: false, stxAddress: null };
  const data = getLocalStorage();
  const addresses = data?.addresses;
  const stxAddr = Array.isArray(addresses)
    ? addresses.find((a: any) => a.symbol === 'STX')?.address ?? addresses[0]?.address ?? null
    : null;
  return { connected: true, stxAddress: stxAddr };
}

export async function callContract(params: {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
}) {
  const response = await (request as any)('stx_callContract', params);
  return response;
}
