'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Copy, Check, AlertCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWalletConnect';
import { toast } from 'react-hot-toast';

export function WalletConnectButton() {
  const { wallet, connect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const address = await connect();
      toast.success(`錢包連接成功！地址: ${address?.slice(0, 6)}...${address?.slice(-4)}`);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast.error(error.message || '錢包連接失敗，請確保已安裝 MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };


  const copyAddress = async () => {
    if (wallet.address) {
      try {
        await navigator.clipboard.writeText(wallet.address);
        setCopied(true);
        toast.success('地址已複製到剪貼板');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('複製失敗');
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (wallet.isConnected && wallet.address) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-600" />
            已連接錢包
          </CardTitle>
          <CardDescription>
            您的錢包已成功連接到 TAR DApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div>
              <p className="text-sm font-medium text-green-900">錢包地址</p>
              <p className="text-sm text-green-700 font-mono">
                {formatAddress(wallet.address)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="text-green-600 hover:text-green-700"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
            >
              <Copy className="h-4 w-4 mr-2" />
              複製地址
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-600" />
          連接錢包
        </CardTitle>
        <CardDescription>
          連接您的 MetaMask 錢包以開始使用 TAR DApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleConnect}
          className="w-full"
          size="lg"
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              連接中...
            </>
          ) : (
            <>
              <Wallet className="h-5 w-5 mr-2" />
              連接 MetaMask
            </>
          )}
        </Button>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            請確保您已安裝 MetaMask 瀏覽器擴展
          </p>
        </div>
        
        {typeof window !== 'undefined' && !(window as any).ethereum && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              未檢測到 MetaMask，請先安裝擴展
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}