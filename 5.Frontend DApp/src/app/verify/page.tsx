'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { VerifyBadge } from '@/components/VerifyBadge';
import { QRGenerator } from '@/components/QRGenerator';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { ReceiptVerifyResponse, ReceiptDetails } from '@/types';
import { apiClient } from '@/services/apiClients';
import { Search, ArrowLeft, Package, ExternalLink, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tokenId, setTokenId] = useState<string>('');
  const [metadataHash, setMetadataHash] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<ReceiptVerifyResponse | null>(null);
  const [receiptDetails, setReceiptDetails] = useState<ReceiptDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const tokenIdParam = searchParams.get('tokenId');
    if (tokenIdParam) {
      setTokenId(tokenIdParam);
      handleGetDetails(parseInt(tokenIdParam));
    }
  }, [searchParams]);

  const handleGetDetails = async (id: number) => {
    setIsLoading(true);
    try {
      const details = await apiClient.getReceiptDetails(id);
      setReceiptDetails(details);
      setMetadataHash(details.metadataHash);
    } catch (error: any) {
      console.error('Get details error:', error);
      toast.error(error.response?.data?.message || '獲取收據詳情失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!tokenId || !metadataHash) {
      toast.error('請填寫 Token ID 和元數據哈希');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await apiClient.verifyReceipt({
        tokenId: parseInt(tokenId),
        metadataHash,
      });
      setVerificationResult(result);
      toast.success('驗證完成');
    } catch (error: any) {
      console.error('Verify error:', error);
      toast.error(error.response?.data?.message || '驗證失敗');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
    }).format(amount);
  };

  const generateVerifyURL = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/verify?tokenId=${tokenId}`;
  };

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
                <h1 className="text-xl font-bold text-gray-900">TAR DApp - 驗證收據</h1>
              </div>
            </div>
            <WalletConnectButton />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Verification Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">驗證收據</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token ID
                  </label>
                  <input
                    type="number"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    className="input-field"
                    placeholder="輸入 Token ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    元數據哈希
                  </label>
                  <input
                    type="text"
                    value={metadataHash}
                    onChange={(e) => setMetadataHash(e.target.value)}
                    className="input-field"
                    placeholder="輸入元數據哈希"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying || !tokenId || !metadataHash}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        驗證中...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        驗證收據
                      </>
                    )}
                  </button>
                  
                  {tokenId && (
                    <button
                      onClick={() => handleGetDetails(parseInt(tokenId))}
                      disabled={isLoading}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        '獲取詳情'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Result */}
            {verificationResult && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">驗證結果</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">狀態:</span>
                    <VerifyBadge 
                      isValid={verificationResult.valid} 
                      isRevoked={verificationResult.revoked}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Token ID:</span>
                    <span className="text-sm font-mono text-gray-900">#{verificationResult.tokenId}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">擁有者:</span>
                    <span className="text-sm font-mono text-gray-900 truncate max-w-xs">
                      {verificationResult.ownerAddress.slice(0, 6)}...{verificationResult.ownerAddress.slice(-4)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">哈希匹配:</span>
                    <span className={`text-sm font-medium ${verificationResult.hashMatches ? 'text-green-600' : 'text-red-600'}`}>
                      {verificationResult.hashMatches ? '是' : '否'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">驗證時間:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(verificationResult.verifiedAt)}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">{verificationResult.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Receipt Details & QR Code */}
          <div className="space-y-6">
            {/* Receipt Details */}
            {receiptDetails && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">收據詳情</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">發票號碼:</span>
                    <span className="text-sm text-gray-900">{receiptDetails.invoiceNo}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">商品名稱:</span>
                    <span className="text-sm text-gray-900">{receiptDetails.itemName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">購買日期:</span>
                    <span className="text-sm text-gray-900">{formatDate(receiptDetails.purchaseDate)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">金額:</span>
                    <span className="text-sm font-medium text-gray-900">{formatAmount(receiptDetails.amount)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">狀態:</span>
                    <VerifyBadge isValid={!receiptDetails.revoked} isRevoked={receiptDetails.revoked} />
                  </div>
                  
                  {receiptDetails.transactionHash && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">交易哈希:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 truncate max-w-xs">
                          {receiptDetails.transactionHash}
                        </span>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${receiptDetails.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR Code Generator */}
            {tokenId && (
              <QRGenerator
                data={generateVerifyURL()}
                title="驗證 QR Code"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
