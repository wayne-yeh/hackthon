'use client';

import React from 'react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Shield, CheckCircle, Users, Star, Search } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWalletConnect';

export default function HomePage() {
  const { wallet } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TAR DApp
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/verify" className="text-gray-600 hover:text-gray-900 transition-colors">
                驗證收據
              </Link>
              {wallet.isConnected && (
                <>
                  <Link href="/issuer" className="text-gray-600 hover:text-gray-900 transition-colors">
                    發行收據
                  </Link>
                  <Link href="/revoke" className="text-gray-600 hover:text-gray-900 transition-colors">
                    作廢收據
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4" />
            區塊鏈資產收據系統
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            數位化您的
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> 資產收據</span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            使用區塊鏈技術創建、驗證和管理您的資產收據。安全、透明、不可篡改的數位收據解決方案。
          </p>

          {wallet.isConnected ? (
            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <Link href="/query-assets">
                  <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    查詢資產
                    <Search className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex justify-center">
                <WalletConnectButton />
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <WalletConnectButton />
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>數位收據</CardTitle>
              <CardDescription>
                將實體收據轉換為區塊鏈上的 NFT，確保永久保存和驗證
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>安全驗證</CardTitle>
              <CardDescription>
                使用加密技術確保收據的真實性和完整性，防止偽造
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>即時驗證</CardTitle>
              <CardDescription>
                隨時隨地驗證收據的有效性，查看詳細的資產信息
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-blue-100">安全保證</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">隨時驗證</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">∞</div>
              <div className="text-blue-100">永久保存</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">0</div>
              <div className="text-blue-100">手續費</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 TAR DApp. 基於區塊鏈的資產收據系統</p>
          </div>
        </div>
      </footer>
    </div>
  );
}