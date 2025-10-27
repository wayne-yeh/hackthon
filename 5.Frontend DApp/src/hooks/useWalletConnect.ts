'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: any;
}

interface WalletContextType {
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    provider: null,
  });

  const connect = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = (window as any).ethereum;
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        const chainId = await provider.request({ method: 'eth_chainId' });

        setWallet({
          isConnected: true,
          address: accounts[0],
          chainId: parseInt(chainId as string, 16),
          provider,
        });
      } else {
        throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      provider: null,
    });
  };

  const switchChain = async (chainId: number) => {
    if (!wallet.provider) {
      throw new Error('Wallet not connected');
    }
    // Implementation for chain switching
  };

  const value = { wallet, connect, disconnect, switchChain };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}