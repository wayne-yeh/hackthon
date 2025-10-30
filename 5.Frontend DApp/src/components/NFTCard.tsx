import React from 'react';
import { ReceiptDetails } from '@/types';
import { ExternalLink, Calendar, DollarSign, Package, User, Hash } from 'lucide-react';

interface NFTCardProps {
  receipt: ReceiptDetails;
  onVerify?: (tokenId: number) => void;
  onViewDetails?: (tokenId: number) => void;
  className?: string;
}

export function NFTCard({ receipt, onVerify, onViewDetails, className = '' }: NFTCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
    }).format(amount);
  };

  const getStatusColor = () => {
    return receipt.revoked ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
  };

  const getStatusText = () => {
    return receipt.revoked ? '已撤銷' : '有效';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{receipt.itemName}</h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Invoice Number */}
        <div className="flex items-center space-x-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">發票號碼:</span>
          <span className="text-sm font-medium text-gray-900">{receipt.invoiceNo}</span>
        </div>

        {/* Purchase Date */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">購買日期:</span>
          <span className="text-sm font-medium text-gray-900">{formatDate(receipt.purchaseDate)}</span>
        </div>

        {/* Amount */}
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">金額:</span>
          <span className="text-sm font-medium text-gray-900">{formatAmount(receipt.amount)}</span>
        </div>

        {/* Owner */}
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">擁有者:</span>
          <span className="text-sm font-mono text-gray-900 truncate">
            {receipt.ownerAddress.slice(0, 6)}...{receipt.ownerAddress.slice(-4)}
          </span>
        </div>

        {/* Token ID */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Token ID:</span>
          <span className="text-sm font-medium text-gray-900">#{receipt.tokenId}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
          {onVerify && !receipt.revoked && (
            <button
              onClick={() => onVerify(receipt.tokenId)}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              驗證
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(receipt.tokenId)}
              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              詳情
            </button>
          )}
          {receipt.transactionHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}










