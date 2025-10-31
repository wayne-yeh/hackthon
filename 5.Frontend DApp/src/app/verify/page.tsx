'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VerifyBadge } from '@/components/VerifyBadge';
import { ReceiptCard } from '@/components/ReceiptCard';
import { ArrowLeft, Search, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { apiService, ReceiptDetails, VerificationResponse } from '@/services/apiService';

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const tokenId = searchParams.get('tokenId');
  
  const [inputTokenId, setInputTokenId] = useState(tokenId || '');
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'valid' | 'invalid' | 'revoked' | 'pending' | 'unknown'>('unknown');

  const verifyReceipt = async (id: string) => {
    if (!id) {
      toast.error('請輸入 Token ID');
      return;
    }

    setIsLoading(true);
    try {
      const tokenIdNum = parseInt(id);
      
      // 先獲取收據詳情（包含 metadataHash）
      const receiptDetails = await apiService.getReceiptDetails(tokenIdNum);
      
      // 如果沒有 metadataHash，無法進行驗證
      if (!receiptDetails.metadataHash) {
        toast.error('收據缺少 metadataHash，無法驗證');
        setReceipt(receiptDetails);
        setVerificationStatus('invalid');
        setIsLoading(false);
        return;
      }
      
      // 使用獲取的 metadataHash 進行驗證
      const verificationResult = await apiService.verifyReceipt({ 
        tokenId: tokenIdNum,
        metadataHash: receiptDetails.metadataHash 
      });
      
      // 合併結果
      const receipt: ReceiptDetails = {
        ...receiptDetails,
        valid: verificationResult.valid,
        revoked: verificationResult.revoked,
      };

      setReceipt(receipt);
      
      // 根據驗證結果設置狀態
      if (verificationResult.revoked) {
        setVerificationStatus('revoked');
        toast.error('收據已被作廢');
      } else if (verificationResult.valid) {
        setVerificationStatus('valid');
        toast.success('驗證成功！收據有效');
      } else {
        setVerificationStatus('invalid');
        toast.error(`驗證失敗：${verificationResult.message || '未知錯誤'}`);
      }
    } catch (error: any) {
      console.error('驗證錯誤:', error);
      const errorMessage = error.response?.data?.message || error.message || '驗證失敗，請檢查 Token ID';
      toast.error(errorMessage);
      setReceipt(null);
      setVerificationStatus('invalid');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tokenId) {
      verifyReceipt(tokenId);
    }
  }, [tokenId]);

  const handleSearch = () => {
    verifyReceipt(inputTokenId);
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
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TAR DApp
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
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Search className="h-4 w-4" />
              收據驗證
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              驗證收據
            </h2>
            <p className="text-gray-600">
              輸入 Token ID 來驗證收據的有效性和真實性
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                驗證收據
              </CardTitle>
              <CardDescription>
                輸入收據的 Token ID 來查看詳細信息和驗證狀態
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenId">Token ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="tokenId"
                    type="number"
                    placeholder="輸入 Token ID..."
                    value={inputTokenId}
                    onChange={(e) => setInputTokenId(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading || !inputTokenId}
                    className="px-6"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        驗證中...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        驗證
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Result */}
          {verificationStatus === 'invalid' ? (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-red-900">
                    <XCircle className="h-5 w-5 text-red-600" />
                    驗證結果
                  </CardTitle>
                  <VerifyBadge status={verificationStatus} size="lg" />
                </div>
                <CardDescription className="text-red-700">
                  {receipt ? `Token ID: ${receipt.tokenId} 的驗證結果` : '驗證失敗'}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-12 w-12 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-900 mb-2">收據驗證失敗</h3>
                  <p className="text-red-700 mb-4">此收據無法通過驗證，可能的原因包括：</p>
                </div>
                <div className="space-y-3 text-left max-w-md mx-auto">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-900">Token ID 不存在或無效</p>
                      <p className="text-sm text-red-700">請確認 Token ID 是否正確</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-900">元數據已被篡改</p>
                      <p className="text-sm text-red-700">收據的元數據與區塊鏈記錄不一致</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-900">區塊鏈記錄不一致</p>
                      <p className="text-sm text-red-700">無法驗證收據的真實性</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : receipt && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    驗證結果
                  </CardTitle>
                  <VerifyBadge status={verificationStatus} size="lg" />
                </div>
                <CardDescription>
                  Token ID: {receipt.tokenId} 的驗證結果
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReceiptCard 
                  receipt={receipt} 
                  showVerifyButton={false}
                />
              </CardContent>
            </Card>
          )}

          {/* Status Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  有效收據
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-green-800">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span>收據信息完整且未被篡改</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span>區塊鏈記錄與元數據一致</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span>擁有者地址正確</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span>收據未被作廢</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  無效收據
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-red-800">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <span>Token ID 不存在</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <span>元數據已被篡改</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <span>區塊鏈記錄不一致</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <span>收據已被作廢</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  );
}