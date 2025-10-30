'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReceiptDetails } from '@/services/apiService';
import { ExternalLink, Copy, Check, Calendar, DollarSign, Package, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReceiptCardProps {
  receipt: ReceiptDetails;
  onVerify?: (tokenId: number) => void;
  showVerifyButton?: boolean;
}

export function ReceiptCard({ receipt, onVerify, showVerifyButton = true }: ReceiptCardProps) {
  const [copied, setCopied] = useState(false);

  const copyTokenId = async () => {
    await navigator.clipboard.writeText(receipt.tokenId.toString());
    setCopied(true);
    toast.success('Token ID 已複製');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
    }).format(amount);
  };

  const getStatusBadge = () => {
    if (receipt.revoked) {
      return <Badge variant="destructive">已撤銷</Badge>;
    }
    if (receipt.valid) {
      return <Badge variant="default" className="bg-green-600">有效</Badge>;
    }
    return <Badge variant="secondary">無效</Badge>;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{receipt.itemName}</CardTitle>
            <CardDescription className="mt-1">
              發票號碼: {receipt.invoiceNo}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Token ID */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Token ID</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">{receipt.tokenId}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyTokenId}
              className="h-6 w-6 p-0"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600">購買日期</p>
              <p className="text-sm font-medium">{formatDate(receipt.purchaseDate)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-green-600">金額</p>
              <p className="text-sm font-medium">{formatAmount(receipt.amount)}</p>
            </div>
          </div>
        </div>

        {/* Owner Address */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">擁有者地址</span>
          </div>
          <p className="text-sm font-mono text-gray-700">
            {receipt.ownerAddress.slice(0, 6)}...{receipt.ownerAddress.slice(-4)}
          </p>
        </div>

        {/* Description */}
        {receipt.description && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{receipt.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {showVerifyButton && onVerify && (
            <Button
              onClick={() => onVerify(receipt.tokenId)}
              className="flex-1"
              variant="outline"
            >
              驗證收據
            </Button>
          )}
          
          {process.env.NEXT_PUBLIC_EXPLORER_URL && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_EXPLORER_URL}/token/${receipt.tokenId}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
