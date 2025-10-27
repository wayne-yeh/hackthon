import React from 'react';
import './globals.css';

export const metadata = {
  title: 'TAR DApp - Tokenized Asset Receipt',
  description: 'Tokenized Asset Receipt DApp with NFT and WalletConnect integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}