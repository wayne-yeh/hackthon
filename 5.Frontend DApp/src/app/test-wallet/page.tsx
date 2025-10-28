// Test page to verify the wallet address and receipts
// /app/test-wallet/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/apiService';

export default function TestWalletPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const testWalletAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

  const loadReceipts = async () => {
    setIsLoading(true);
    try {
      console.log('Loading receipts for test address:', testWalletAddress);
      const result = await apiService.getOwnerReceipts(testWalletAddress);
      console.log('Received receipts:', result);
      setReceipts(result);
    } catch (error: any) {
      console.error('Error loading receipts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>錢包測試頁面</CardTitle>
          <CardDescription>測試地址: {testWalletAddress}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={loadReceipts} disabled={isLoading}>
              {isLoading ? '載入中...' : '重新載入'}
            </Button>
            
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2">收據列表 ({receipts.length} 個)</h3>
              <div className="space-y-2">
                {receipts.map((receipt, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">Token ID: {receipt.tokenId}</p>
                        <p className="text-sm text-gray-600">物品: {receipt.itemName}</p>
                        <p className="text-sm text-gray-600">金額: {receipt.amount}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        發票號: {receipt.invoiceNo}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}









