'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ReceiptForm } from '@/components/ReceiptForm';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useWallet } from '@/hooks/useWalletConnect';
import { ReceiptData, ReceiptIssueResponse } from '@/types';
import { apiClient } from '@/services/apiClients';
import { Package, ArrowLeft, CheckCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IssuerPage() {
  const router = useRouter();
  const { wallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [issuedReceipt, setIssuedReceipt] = useState<ReceiptIssueResponse | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is authorized (simple token check)
    const token = process.env.NEXT_PUBLIC_ISSUER_TOKEN;
    if (token && token !== 'change-this-in-production') {
      setIsAuthorized(true);
    } else {
      toast.error('未授權訪問發行頁面');
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (data: ReceiptData) => {
    if (!wallet.isConnected) {
      toast.error('請先連接錢包');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.issueReceipt(data);
      setIssuedReceipt(response);
      toast.success('收據發行成功！');
    } catch (error: any) {
      console.error('Issue receipt error:', error);
      toast.error(error.response?.data?.message || '發行收據失敗');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">未授權訪問</h1>
          <p className="text-gray-600 mb-4">您沒有權限訪問發行頁面</p>
          <Link href="/" className="btn-primary">
            返回首頁
          </Link>
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
                <h1 className="text-xl font-bold text-gray-900">TAR DApp - 發行收據</h1>
              </div>
            </div>
            <WalletConnectButton />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {issuedReceipt ? (
          /* Success State */
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h2 className="text-lg font-semibold text-green-800">收據發行成功！</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Token ID:</span>
                  <span className="text-sm font-mono text-gray-900">#{issuedReceipt.tokenId}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">交易哈希:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-gray-900 truncate max-w-xs">
                      {issuedReceipt.transactionHash}
                    </span>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${issuedReceipt.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">元數據 URI:</span>
                  <span className="text-sm font-mono text-gray-900 truncate max-w-xs">
                    {issuedReceipt.metadataUri}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">元數據哈希:</span>
                  <span className="text-sm font-mono text-gray-900 truncate max-w-xs">
                    {issuedReceipt.metadataHash}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">擁有者地址:</span>
                  <span className="text-sm font-mono text-gray-900 truncate max-w-xs">
                    {issuedReceipt.ownerAddress}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Link
                href={`/verify?tokenId=${issuedReceipt.tokenId}`}
                className="btn-primary"
              >
                驗證收據
              </Link>
              <button
                onClick={() => setIssuedReceipt(null)}
                className="btn-secondary"
              >
                發行新收據
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">發行新收據</h1>
              <p className="text-gray-600">
                填寫以下信息來發行一個新的 Tokenized Asset Receipt
              </p>
            </div>

            {!wallet.isConnected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-800">
                    請先連接錢包以發行收據
                  </span>
                </div>
              </div>
            )}

            <ReceiptForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
