'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, XCircle, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { apiService, ReceiptDetails } from '@/services/apiService';

export default function RevokePage() {
  const [inputTokenId, setInputTokenId] = useState('');
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevoked, setIsRevoked] = useState(false);

  const revokeReceipt = async (id: string) => {
    if (!id) {
      toast.error('請輸入 Token ID');
      return;
    }

    const tokenIdNum = parseInt(id);
    if (isNaN(tokenIdNum) || tokenIdNum < 0) {
      toast.error('請輸入有效的 Token ID');
      return;
    }

    setIsLoading(true);
    setIsRevoked(false);
    setReceipt(null);

    try {
      // 先獲取收據詳情以確認收據存在
      const receiptDetails = await apiService.getReceiptDetails(tokenIdNum);
      setReceipt(receiptDetails);

      // 檢查是否已經作廢
      if (receiptDetails.revoked) {
        toast.error('此收據已經被作廢');
        setIsRevoked(true);
        setIsLoading(false);
        return;
      }

      // 執行作廢操作
      await apiService.revokeReceipt(tokenIdNum);
      
      setIsRevoked(true);
      toast.success('收據作廢成功！');
      
      // 重新獲取收據詳情以更新狀態
      const updatedReceipt = await apiService.getReceiptDetails(tokenIdNum);
      setReceipt(updatedReceipt);
    } catch (error: any) {
      console.error('作廢錯誤:', error);
      const errorMessage = error.response?.data?.message || error.message || '作廢收據失敗，請檢查 Token ID';
      toast.error(errorMessage);
      setReceipt(null);
      setIsRevoked(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = () => {
    revokeReceipt(inputTokenId);
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
                <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DREAMCHAIN
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <XCircle className="h-4 w-4" />
              作廢收據
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              作廢收據
            </h2>
            <p className="text-gray-600">
              輸入 Token ID 來作廢收據。作廢後的收據將無法再使用。
            </p>
          </div>

          {/* Revoke Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                作廢收據
              </CardTitle>
              <CardDescription>
                輸入要作廢的收據 Token ID（例如：0）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenId">Token ID</Label>
                <Input
                  id="tokenId"
                  type="number"
                  placeholder="例如：0"
                  value={inputTokenId}
                  onChange={(e) => setInputTokenId(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleRevoke();
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleRevoke}
                disabled={isLoading || !inputTokenId}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    處理中...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-5 w-5" />
                    作廢收據
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Display */}
          {receipt && (
            <Card className={isRevoked ? 'border-red-200 bg-red-50' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isRevoked ? (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      收據已作廢
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-gray-600" />
                      收據詳情
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Token ID</Label>
                    <p className="text-lg font-semibold">{receipt.tokenId}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">狀態</Label>
                    <p className="text-lg font-semibold">
                      {receipt.revoked ? (
                        <span className="text-red-600">已作廢</span>
                      ) : (
                        <span className="text-green-600">有效</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">發票號碼</Label>
                    <p className="text-lg font-semibold">{receipt.invoiceNo}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">金額</Label>
                    <p className="text-lg font-semibold">${receipt.amount}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm text-gray-500">品項</Label>
                    <p className="text-lg font-semibold">{receipt.itemName}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm text-gray-500">擁有者地址</Label>
                    <p className="text-sm font-mono break-all">{receipt.ownerAddress}</p>
                  </div>
                  {receipt.revokedAt && (
                    <div className="col-span-2">
                      <Label className="text-sm text-gray-500">作廢時間</Label>
                      <p className="text-sm">{new Date(receipt.revokedAt).toLocaleString('zh-TW')}</p>
                    </div>
                  )}
                </div>
                {isRevoked && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <CheckCircle className="h-5 w-5" />
                      <p className="font-medium">收據已成功作廢</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

