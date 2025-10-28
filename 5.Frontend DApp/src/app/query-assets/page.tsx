'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ReceiptCard } from '@/components/ReceiptCard';
import { ArrowLeft, Search, Receipt, RefreshCw, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { apiService, ReceiptDetails } from '@/services/apiService';

export default function QueryAssetsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [walletAddress, setWalletAddress] = useState('');
  const [receipts, setReceipts] = useState<ReceiptDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 從 URL 參數獲取錢包地址
  useEffect(() => {
    const address = searchParams.get('address');
    if (address) {
      setWalletAddress(address);
      searchReceipts(address);
    }
  }, [searchParams]);

  const searchReceipts = async (address?: string) => {
    const targetAddress = address || walletAddress.trim();
    
    if (!targetAddress) {
      toast.error('請輸入錢包地址');
      return;
    }

    // 驗證以太坊地址格式
    if (!/^0x[a-fA-F0-9]{40}$/.test(targetAddress)) {
      toast.error('請輸入有效的以太坊地址');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      console.log('查詢收據:', targetAddress);
      const fetchedReceipts = await apiService.getOwnerReceipts(targetAddress);
      console.log('獲得的收據:', fetchedReceipts);
      setReceipts(fetchedReceipts);
      
      if (fetchedReceipts.length > 0) {
        toast.success(`找到 ${fetchedReceipts.length} 個收據`);
      } else {
        toast('此錢包地址沒有收據', { icon: 'ℹ️' });
      }
    } catch (error: any) {
      console.error('查詢收據失敗:', error);
      toast.error(error.message || '查詢失敗，請檢查地址是否正確');
      setReceipts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    searchReceipts();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 計算統計信息
  const totalReceipts = receipts.length;
  const activeReceipts = receipts.filter(r => !r.revoked).length;
  const revokedReceipts = receipts.filter(r => r.revoked).length;

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
                  <Search className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  查詢資產
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Search className="h-4 w-4" />
              資產查詢
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
              查詢錢包收據
            </h2>
            <p className="text-lg text-gray-600">
              輸入錢包地址來查看該地址的所有代幣化資產收據
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                錢包地址查詢
              </CardTitle>
              <CardDescription>
                輸入以太坊錢包地址來查詢該地址的收據
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet-address">錢包地址</Label>
                <Input
                  id="wallet-address"
                  type="text"
                  placeholder="0x1234567890123456789012345678901234567890"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="font-mono"
                />
              </div>
              
              <Button 
                onClick={handleSearch} 
                disabled={isLoading || !walletAddress.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    查詢中...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    查詢收據
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {hasSearched && (
            <div className="space-y-6">
              {/* Statistics */}
              {receipts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-green-600" />
                      查詢結果
                    </CardTitle>
                    <CardDescription>
                      錢包地址: {walletAddress}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{totalReceipts}</div>
                        <div className="text-sm text-blue-800">總收據</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{activeReceipts}</div>
                        <div className="text-sm text-green-800">有效收據</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-600">{revokedReceipts}</div>
                        <div className="text-sm text-red-800">已撤銷</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Receipts List */}
              {isLoading ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">查詢收據中...</p>
                  </CardContent>
                </Card>
              ) : receipts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">此錢包地址沒有收據</p>
                    <p className="text-sm text-gray-500">
                      請確認地址是否正確，或該地址尚未發行任何收據
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">收據列表</h3>
                    <Badge variant="outline">{receipts.length} 個收據</Badge>
                  </div>
                  
                  <div className="grid gap-4">
                    {receipts.map(receipt => (
                      <ReceiptCard 
                        key={receipt.tokenId} 
                        receipt={receipt} 
                        explorerUrl={process.env.NEXT_PUBLIC_EXPLORER_URL}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}








