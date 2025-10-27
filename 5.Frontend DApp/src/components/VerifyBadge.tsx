import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface VerifyBadgeProps {
  isValid: boolean | null;
  isRevoked?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function VerifyBadge({ isValid, isRevoked = false, isLoading = false, className = '' }: VerifyBadgeProps) {
  if (isLoading) {
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 ${className}`}>
        <Clock className="h-4 w-4 mr-1 animate-spin" />
        驗證中...
      </div>
    );
  }

  if (isRevoked) {
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 ${className}`}>
        <XCircle className="h-4 w-4 mr-1" />
        已撤銷
      </div>
    );
  }

  if (isValid === true) {
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 ${className}`}>
        <CheckCircle className="h-4 w-4 mr-1" />
        有效
      </div>
    );
  }

  if (isValid === false) {
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 ${className}`}>
        <XCircle className="h-4 w-4 mr-1" />
        無效
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 ${className}`}>
      <AlertCircle className="h-4 w-4 mr-1" />
      未驗證
    </div>
  );
}
