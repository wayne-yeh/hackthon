'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check } from 'lucide-react';

interface QRGeneratorProps {
  data: string;
  title?: string;
  className?: string;
}

export function QRGenerator({ data, title = 'QR Code', className = '' }: QRGeneratorProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [data]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeDataURL(qrCodeDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeDataURL) {
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = qrCodeDataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        
        {isGenerating ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : qrCodeDataURL ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={qrCodeDataURL}
                alt="QR Code"
                className="border border-gray-200 rounded-lg"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 break-all">{data}</p>
              
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={downloadQRCode}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  下載
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      已複製
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      複製
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">無法生成 QR Code</p>
          </div>
        )}
      </div>
    </div>
  );
}
