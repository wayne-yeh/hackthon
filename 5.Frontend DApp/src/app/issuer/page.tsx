'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReceiptForm } from '@/components/ReceiptForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiService, ReceiptIssueRequest } from '@/services/apiService';
import { ArrowLeft, Receipt, Upload, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export default function IssuerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: ReceiptIssueRequest) => {
    setIsSubmitting(true);
    try {
      console.log('發行收據數據:', formData);
      const result = await apiService.issueReceipt(formData);
      console.log('發行結果:', result);
      toast.success(`收據發行成功！Token ID: ${result.tokenId}`);
      
      // 等待一下讓用戶看到成功消息
      setTimeout(() => {
        router.push('/my');
      }, 1500);
    } catch (error: any) {
      console.error('發行收據錯誤:', error);
      toast.error(error.message || '發行失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <CheckCircle className="h-4 w-4" />
              發行收據
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              開立收據
            </h2>
          </div>

          {/* Form Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>
                收據信息
              </CardTitle>
              <CardDescription>
                請填寫完整的收據信息，所有字段都是必填的
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReceiptForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-900">發行流程</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>填寫收據信息</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>上傳資產圖片</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>確認並發行 NFT</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <span>獲得 Token ID</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-900">重要提醒</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-green-800">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span>收據一旦發行將永久保存在區塊鏈上</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span>請確保所有信息準確無誤</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span>圖片將上傳到 IPFS 進行永久存儲</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span>發行後可隨時驗證收據真偽</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}