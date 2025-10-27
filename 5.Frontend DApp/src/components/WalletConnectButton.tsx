'use client';

import React, { useState } from 'react';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { useWallet } from '@/hooks/useWalletConnect';

interface WalletConnectButtonProps {
  className?: string;
}

export function WalletConnectButton({ className = '' }: WalletConnectButtonProps) {
  const { wallet, connect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (wallet.address) {
      try {
        await navigator.clipboard.writeText(wallet.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (wallet.isConnected) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">已連接</span>
        </div>
        
        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <Wallet className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-mono text-gray-900">
            {formatAddress(wallet.address)}
          </span>
          <button
            onClick={copyAddress}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
        
        <button
          onClick={disconnect}
          className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>斷開</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors ${className}`}
    >
      <Wallet className="h-5 w-5" />
      <span>連接錢包</span>
    </button>
  );
}
