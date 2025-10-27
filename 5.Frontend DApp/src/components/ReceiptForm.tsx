'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ReceiptData } from '@/types';
import { Package, Calendar, DollarSign, User, FileText, Upload } from 'lucide-react';

interface ReceiptFormProps {
  onSubmit: (data: ReceiptData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function ReceiptForm({ onSubmit, isLoading = false, className = '' }: ReceiptFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReceiptData>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = async (data: ReceiptData) => {
    try {
      await onSubmit(data);
      reset();
      setImageFile(null);
      setImagePreview('');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">發行收據</h2>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Invoice Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="h-4 w-4 inline mr-1" />
            發票號碼 *
          </label>
          <input
            type="text"
            {...register('invoiceNo', { required: '發票號碼為必填項目' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例如: INV-001"
          />
          {errors.invoiceNo && (
            <p className="mt-1 text-sm text-red-600">{errors.invoiceNo.message}</p>
          )}
        </div>

        {/* Purchase Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            購買日期 *
          </label>
          <input
            type="date"
            {...register('purchaseDate', { required: '購買日期為必填項目' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.purchaseDate && (
            <p className="mt-1 text-sm text-red-600">{errors.purchaseDate.message}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="h-4 w-4 inline mr-1" />
            金額 *
          </label>
          <input
            type="number"
            step="0.01"
            {...register('amount', { 
              required: '金額為必填項目',
              min: { value: 0.01, message: '金額必須大於 0' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="h-4 w-4 inline mr-1" />
            商品名稱 *
          </label>
          <input
            type="text"
            {...register('itemName', { required: '商品名稱為必填項目' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例如: 黃金條"
          />
          {errors.itemName && (
            <p className="mt-1 text-sm text-red-600">{errors.itemName.message}</p>
          )}
        </div>

        {/* Owner Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-1" />
            擁有者地址 *
          </label>
          <input
            type="text"
            {...register('ownerAddress', { 
              required: '擁有者地址為必填項目',
              pattern: {
                value: /^0x[a-fA-F0-9]{40}$/,
                message: '請輸入有效的以太坊地址'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0x..."
          />
          {errors.ownerAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.ownerAddress.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            描述
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="商品描述..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Upload className="h-4 w-4 inline mr-1" />
            商品圖片
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 w-32 object-cover rounded-md border border-gray-300"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '發行中...' : '發行收據'}
          </button>
        </div>
      </form>
    </div>
  );
}
