'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NFTCard } from '@/components/NFTCard';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useWallet } from '@/hooks/useWalletConnect';
import { ReceiptDetails } from '@/types';
import { apiClient } from '@/services/apiClients';
import { Package, ArrowLeft, RefreshCw, User, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyPage() {
  const { wallet } = useWallet();
  const [receipts, setReceipts] = useState<ReceiptDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active'>('all');

  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      loadReceipts();
    }
  }, [wallet.isConnected, wallet.address, activeTab]);

  const loadReceipts = async () => {
    if (!wallet.address) return;

    setIsLoading(true);
    try {
      const data = activeTab === 'active' 
        ? await apiClient.getOwnerActiveReceipts(wallet.address)
        : await apiClient.getOwnerReceipts(wallet.address);
      setReceipts(data);
    } catch (error: any) {
      console.error('Load receipts error:', error);
      toast.error(error.response?.data?.message || '載入收據失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = (tokenId: number) => {
    window.open(`/verify?tokenId=${tokenId}`, '_blank');
  };

  const handleViewDetails = (tokenId: number) => {
    window.open(`/verify?tokenId=${tokenId}`, '_blank');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-5 w-5" />
                  <span>返回首頁</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <Package className="h-8 w-8 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-900">TAR DApp - 我的收據</h1>
                </div>
              </div>
              <WalletConnectButton />
            </div>
          </div>
        </nav>

        {/* Not Connected State */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-6">
              <Wallet className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">請先連接錢包</h1>
            <p className="text-gray-600 mb-8">
              連接您的錢包以查看您擁有的 Tokenized Asset Receipt
            </p>
            <WalletConnectButton className="text-lg px-8 py-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>返回首頁</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">TAR DApp - 我的收據</h1>
              </div>
            </div>
            <WalletConnectButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">我的收據</h1>
              <p className="text-gray-600 mt-1">
                錢包地址: <span className="font-mono">{formatAddress(wallet.address)}</span>
              </p>
            </div>
            <button
              onClick={loadReceipts}
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新載入
                </>
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                所有收據 ({receipts.length})
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                有效收據 ({receipts.filter(r => !r.revoked).length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">載入收據中...</p>
            </div>
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'active' ? '沒有有效收據' : '沒有收據'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'active' 
                ? '您目前沒有有效的收據' 
                : '您目前沒有任何收據'
              }
            </p>
            <Link href="/issuer" className="btn-primary">
              發行新收據
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receipts.map((receipt) => (
              <NFTCard
                key={receipt.tokenId}
                receipt={receipt}
                onVerify={handleVerify}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {receipts.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">統計信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{receipts.length}</div>
                <div className="text-sm text-gray-600">總收據數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {receipts.filter(r => !r.revoked).length}
                </div>
                <div className="text-sm text-gray-600">有效收據</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {receipts.filter(r => r.revoked).length}
                </div>
                <div className="text-sm text-gray-600">已撤銷收據</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
