'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReceiptCard } from '@/components/ReceiptCard';
import { ArrowLeft, Receipt, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { apiService, ReceiptDetails } from '@/services/apiService';

export default function ForceTestPage() {
  const [receipts, setReceipts] = useState<ReceiptDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

  const loadReceipts = async () => {
    setIsLoading(true);
    try {
      console.log('強制載入收據，地址:', walletAddress);
      const fetchedReceipts = await apiService.getOwnerReceipts(walletAddress);
      console.log('收到收據:', fetchedReceipts);
      setReceipts(fetchedReceipts);
      toast.success(`找到 ${fetchedReceipts.length} 個收據`);
    } catch (error: any) {
      console.error('載入收據錯誤:', error);
      toast.error(error.message || '載入收據失敗');
      setReceipts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const handleVerify = (tokenId: number) => {
    window.open(`/verify?tokenId=${tokenId}`, '_blank');
  };

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
                  強制測試頁面
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
              強制測試收據顯示
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">測試錢包地址收據</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              此頁面直接調用 API 獲取指定錢包地址的收據，無需連接 MetaMask
            </p>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>測試地址:</strong> {walletAddress}
              </p>
            </div>
          </div>

          {/* Receipts List */}
          {isLoading ? (
            <div className="text-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">載入收據中...</p>
            </div>
          ) : receipts.length === 0 ? (
            <Card className="max-w-md mx-auto text-center p-6 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardTitle className="text-xl text-gray-800 mb-3">沒有找到收據</CardTitle>
              <CardContent className="p-0 text-gray-600">
                該地址目前沒有任何收據。
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  找到 {receipts.length} 個收據
                </h3>
                <p className="text-gray-600">以下是該錢包地址的所有收據</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {receipts.map(receipt => (
                  <ReceiptCard 
                    key={receipt.tokenId} 
                    receipt={receipt} 
                    onVerify={handleVerify} 
                    explorerUrl={process.env.NEXT_PUBLIC_EXPLORER_URL} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

