'use client';

import React, { useState } from 'react';
import { Play, Copy, Check, RefreshCw, ExternalLink } from 'lucide-react';

interface ApiResponse {
  status: number;
  data: any;
  error?: string;
}

export default function ApiTestPage() {
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const makeRequest = async (url: string, options: RequestInit, key: string) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      setResponses(prev => ({ ...prev, [key]: { status: response.status, data } }));
    } catch (error) {
      setResponses(prev => ({ 
        ...prev, 
        [key]: { 
          status: 0, 
          data: null, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const ApiButton = ({ 
    title, 
    url, 
    method, 
    headers = {}, 
    body, 
    key 
  }: {
    title: string;
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
    key: string;
  }) => {
    const handleClick = () => {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };
      
      if (body && method !== 'GET') {
        options.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
      
      makeRequest(url, options, key);
    };

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              method === 'GET' ? 'bg-green-100 text-green-800' :
              method === 'POST' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {method}
            </span>
            <button
              onClick={handleClick}
              disabled={loading[key]}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading[key] ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>{loading[key] ? 'Loading...' : 'Test'}</span>
            </button>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">URL:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">{url}</code>
            <button
              onClick={() => copyToClipboard(url, `url-${key}`)}
              className="text-gray-500 hover:text-gray-700"
            >
              {copied === `url-${key}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          
          {Object.keys(headers).length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Headers:</span>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-x-auto">
                {JSON.stringify(headers, null, 2)}
              </pre>
            </div>
          )}
          
          {body && (
            <div>
              <span className="font-medium text-gray-700">Body:</span>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-x-auto">
                {typeof body === 'string' ? body : JSON.stringify(body, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Response Display */}
        {responses[key] && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">Response:</span>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  responses[key].status >= 200 && responses[key].status < 300 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {responses[key].status || 'Error'}
                </span>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(responses[key].data, null, 2), `response-${key}`)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {copied === `response-${key}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
              {responses[key].error || JSON.stringify(responses[key].data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">API</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">TAR DApp API 測試工具</h1>
            </div>
            <div className="text-sm text-gray-600">
              直接測試所有 API 端點
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Smart Contract Service */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Smart Contract Service</h2>
          <div className="space-y-4">
            <ApiButton
              title="檢查區塊鏈連接"
              url="http://localhost:8545"
              method="POST"
              body='{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
              key="blockchain-check"
            />
          </div>
        </div>

        {/* Metadata Service */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Metadata Service</h2>
          <div className="space-y-4">
            <ApiButton
              title="健康檢查"
              url="http://localhost:8081/actuator/health"
              method="GET"
              key="metadata-health"
            />
            
            <ApiButton
              title="上傳收據元數據"
              url="http://localhost:8081/api/metadata/receipts"
              method="POST"
              headers={{
                'Content-Type': 'application/x-www-form-urlencoded',
              }}
              body="invoiceNo=TEST-001&purchaseDate=2023-10-24&amount=1000.00&itemName=Test Item&ownerAddress=0x1234567890123456789012345678901234567890"
              key="metadata-upload"
            />
            
            <ApiButton
              title="獲取元數據哈希"
              url="http://localhost:8081/api/metadata/hash?url=ipfs://test-hash"
              method="GET"
              key="metadata-hash"
            />
          </div>
        </div>

        {/* Backend Core API */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Backend Core API</h2>
          <div className="space-y-4">
            <ApiButton
              title="健康檢查"
              url="http://localhost:8083/actuator/health"
              method="GET"
              key="backend-health"
            />
            
            <ApiButton
              title="發行收據"
              url="http://localhost:8083/api/v1/receipts/issue"
              method="POST"
              headers={{
                'X-API-Key': 'change-this-in-production',
              }}
              body={{
                "invoiceNo": "INV-005",
                "purchaseDate": "2024-01-01",
                "amount": 100.50,
                "itemName": "Gold Bar",
                "ownerAddress": "0x1234567890123456789012345678901234567890",
                "description": "High purity gold bar",
                "metadata": {
                  "purity": "99.9%",
                  "weight": "100g"
                }
              }}
              key="issue-receipt"
            />
            
            <ApiButton
              title="驗證收據"
              url="http://localhost:8083/api/v1/receipts/verify"
              method="POST"
              body={{
                "tokenId": 818011,
                "metadataHash": "a9a4c7989845016f118d19c1adeae37c110ab1756ca02f269c460a80e31f6711"
              }}
              key="verify-receipt"
            />
            
            <ApiButton
              title="獲取收據詳情"
              url="http://localhost:8083/api/v1/receipts/898011/details"
              method="GET"
              key="receipt-details"
            />
            
            <ApiButton
              title="撤銷收據"
              url="http://localhost:8083/api/v1/receipts/650575/revoke"
              method="POST"
              headers={{
                'X-API-Key': 'change-this-in-production',
              }}
              key="revoke-receipt"
            />
            
            <ApiButton
              title="獲取擁有者的有效收據"
              url="http://localhost:8083/api/v1/receipts/owner/0x1234567890123456789012345678901234567890/active"
              method="GET"
              headers={{
                'X-API-Key': 'change-this-in-production',
              }}
              key="owner-active-receipts"
            />
            
            <ApiButton
              title="獲取擁有者的所有收據"
              url="http://localhost:8083/api/v1/receipts/owner/0x1234567890123456789012345678901234567890"
              method="GET"
              headers={{
                'X-API-Key': 'change-this-in-production',
              }}
              key="owner-all-receipts"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="http://localhost:8083/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Backend API 文檔</h4>
                <p className="text-sm text-blue-700">Swagger UI</p>
              </div>
            </a>
            <a
              href="http://localhost:8081/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Metadata API 文檔</h4>
                <p className="text-sm text-green-700">Swagger UI</p>
              </div>
            </a>
            <a
              href="http://localhost:8082/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-purple-600" />
              <div>
                <h4 className="font-medium text-purple-900">Verification API 文檔</h4>
                <p className="text-sm text-purple-700">Swagger UI</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

