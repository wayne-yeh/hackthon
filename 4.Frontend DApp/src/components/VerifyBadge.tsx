'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface VerifyBadgeProps {
  status: 'valid' | 'invalid' | 'revoked' | 'pending' | 'unknown';
  size?: 'sm' | 'md' | 'lg';
}

export function VerifyBadge({ status, size = 'md' }: VerifyBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'valid':
        return {
          icon: CheckCircle,
          variant: 'default' as const,
          className: 'bg-green-600 hover:bg-green-700 text-white',
          text: '有效',
        };
      case 'invalid':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          className: 'bg-red-600 hover:bg-red-700 text-white',
          text: '無效',
        };
      case 'revoked':
        return {
          icon: AlertCircle,
          variant: 'destructive' as const,
          className: 'bg-orange-600 hover:bg-orange-700 text-white',
          text: '已作廢',
        };
      case 'pending':
        return {
          icon: Clock,
          variant: 'secondary' as const,
          className: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          text: '驗證中',
        };
      default:
        return {
          icon: AlertCircle,
          variant: 'outline' as const,
          className: 'bg-gray-600 hover:bg-gray-700 text-white',
          text: '未知',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1`}
    >
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />
      {config.text}
    </Badge>
  );
}