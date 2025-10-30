'use client';

import { useState, useEffect } from 'react';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: any;
}

// 簡化的錢包狀態管理
let walletState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  provider: null,
};

let listeners: Array<(state: WalletState) => void> = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener(walletState));
};

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>(walletState);

  useEffect(() => {
    // 添加監聽器
    listeners.push(setWallet);
    
    // 檢查初始連接狀態
    checkInitialConnection();

    return () => {
      listeners = listeners.filter(listener => listener !== setWallet);
    };
  }, []);

  const checkInitialConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = (window as any).ethereum;
        const accounts = await provider.request({ method: 'eth_accounts' });
        
        if (accounts && accounts.length > 0) {
          const chainId = await provider.request({ method: 'eth_chainId' });
          walletState = {
            isConnected: true,
            address: accounts[0],
            chainId: parseInt(chainId as string, 16),
            provider,
          };
          notifyListeners();
        }
      } catch (error) {
        console.log('No initial connection found');
      }
    }
  };

  const connect = async () => {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('請安裝 MetaMask 錢包');
      }

      const provider = (window as any).ethereum;
      
      // 請求連接
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('用戶拒絕連接錢包');
      }

      const chainId = await provider.request({ method: 'eth_chainId' });

      // 更新狀態
      walletState = {
        isConnected: true,
        address: accounts[0],
        chainId: parseInt(chainId as string, 16),
        provider,
      };

      notifyListeners();

      // 設置事件監聽器
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);

      console.log('錢包連接成功:', accounts[0]);
      return accounts[0];

    } catch (error: any) {
      console.error('錢包連接失敗:', error);
      throw new Error(error.message || '錢包連接失敗');
    }
  };

  const disconnect = async () => {
    try {
      console.log('開始斷開連接...');
      
      // 強制清除所有狀態
      walletState = {
        isConnected: false,
        address: null,
        chainId: null,
        provider: null,
      };

      // 立即通知所有監聽器
      notifyListeners();

      // 移除所有事件監聽器
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = (window as any).ethereum;
        
        // 移除所有可能的事件監聽器
        try {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
          provider.removeAllListeners('accountsChanged');
          provider.removeAllListeners('chainChanged');
        } catch (e) {
          console.log('移除事件監聽器時出錯:', e);
        }
      }

      // 強制刷新頁面狀態（可選）
      setTimeout(() => {
        notifyListeners();
      }, 100);

      console.log('錢包已完全斷開連接');
    } catch (error) {
      console.error('斷開連接錯誤:', error);
      // 即使出錯也要清除狀態
      walletState = {
        isConnected: false,
        address: null,
        chainId: null,
        provider: null,
      };
      notifyListeners();
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      walletState = {
        ...walletState,
        address: accounts[0],
      };
      notifyListeners();
    }
  };

  const handleChainChanged = (chainId: string) => {
    walletState = {
      ...walletState,
      chainId: parseInt(chainId, 16),
    };
    notifyListeners();
  };

  const switchChain = async (chainId: number) => {
    if (!walletState.provider) {
      throw new Error('錢包未連接');
    }

    try {
      await walletState.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await walletState.provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: 'Local Hardhat',
              rpcUrls: ['http://localhost:8545'],
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ],
        });
      } else {
        throw error;
      }
    }
  };

  return { 
    wallet, 
    connect, 
    disconnect, 
    switchChain 
  };
}