'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReceiptCard } from '@/components/ReceiptCard';
import { ArrowLeft, Receipt, Plus, RefreshCw, Filter } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useWallet } from '@/hooks/useWalletConnect';
import { apiService, ReceiptDetails } from '@/services/apiService';

export default function MyPage() {
  const { wallet } = useWallet();
  const [receipts, setReceipts] = useState<ReceiptDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'valid' | 'revoked'>('all');

  const loadReceipts = async () => {
          if (!wallet.isConnected || !wallet.address) {
            console.log('Wallet not connected:', { isConnected: wallet.isConnected, address: wallet.address });
            setReceipts([]);
            return;
          }

    setIsLoading(true);
    try {
      console.log('Loading receipts for address:', wallet.address);
      const receipts = await apiService.getOwnerReceipts(wallet.address);
      console.log('Received receipts:', receipts);
      setReceipts(receipts);
      if (receipts.length > 0) {
        toast.success(`找到 ${receipts.length} 個收據`);
      } else {
        toast('您還沒有任何收據', { icon: 'ℹ️' });
      }
    } catch (error: any) {
      console.error('Error loading receipts:', error);
      toast.error(error.message || '載入收據失敗');
      setReceipts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = (tokenId: number) => {
    window.open(`/verify?tokenId=${tokenId}`, '_blank');
  };

  const filteredReceipts = receipts.filter(receipt => {
    if (filter === 'all') return true;
    if (filter === 'valid') return receipt.valid && !receipt.revoked;
    if (filter === 'revoked') return receipt.revoked;
    return true;
  });

  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      loadReceipts();
    }
  }, [wallet.isConnected, wallet.address]);

  // 當頁面重新獲得焦點時刷新數據
  useEffect(() => {
    const handleFocus = () => {
      if (wallet.isConnected && wallet.address) {
        console.log('頁面重新獲得焦點，刷新收據數據');
        loadReceipts();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [wallet.isConnected, wallet.address]);

  // 調試信息
  console.log('My page wallet state:', wallet);

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首頁
                </Button>
              </Link>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  需要連接錢包
                </CardTitle>
                <CardDescription>
                  請先連接您的錢包以查看收據
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>調試信息:</p>
                    <p>isConnected: {wallet.isConnected ? 'true' : 'false'}</p>
                    <p>address: {wallet.address || 'null'}</p>
                  </div>
                  <Link href="/">
                    <Button className="w-full">
                      連接錢包
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首頁
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TAR DApp
                </h1>
              </div>
            </div>
            
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadReceipts}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        刷新
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          console.log('強制刷新收據，當前錢包狀態:', wallet);
                          loadReceipts();
                        }}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        強制刷新
                      </Button>
                      <Link href="/issuer">
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          發行收據
                        </Button>
                      </Link>
                    </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Receipt className="h-4 w-4" />
              我的收據
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              我的資產收據
            </h2>
            <p className="text-gray-600">
              管理您擁有的所有 Tokenized Asset Receipt
            </p>
          </div>

          {/* Stats and Filters */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{receipts.length}</div>
                <div className="text-sm text-gray-600">總收據數</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {receipts.filter(r => r.valid && !r.revoked).length}
                </div>
                <div className="text-sm text-gray-600">有效收據</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">
                  {receipts.filter(r => r.revoked).length}
                </div>
                <div className="text-sm text-gray-600">已撤銷</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">
                  {receipts.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">總價值 (TWD)</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              全部
            </Button>
            <Button
              variant={filter === 'valid' ? 'default' : 'outline'}
              onClick={() => setFilter('valid')}
              size="sm"
            >
              有效
            </Button>
            <Button
              variant={filter === 'revoked' ? 'default' : 'outline'}
              onClick={() => setFilter('revoked')}
              size="sm"
            >
              已撤銷
            </Button>
          </div>

          {/* Receipts Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">載入收據中...</p>
            </div>
          ) : filteredReceipts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReceipts.map((receipt) => (
                <ReceiptCard
                  key={receipt.tokenId}
                  receipt={receipt}
                  onVerify={handleVerify}
                  showVerifyButton={true}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {filter === 'all' ? '沒有收據' : `沒有${filter === 'valid' ? '有效' : '已撤銷'}收據`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' 
                    ? '您還沒有任何收據，開始發行您的第一個收據吧！'
                    : `您目前沒有${filter === 'valid' ? '有效' : '已撤銷'}的收據`
                  }
                </p>
                {filter === 'all' && (
                  <Link href="/issuer">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      發行收據
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}