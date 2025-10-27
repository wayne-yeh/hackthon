'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { apiService, ReceiptIssueRequest } from '@/services/apiService';

interface ReceiptFormProps {
  onSubmit: (data: ReceiptIssueRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export function ReceiptForm({ onSubmit, isSubmitting = false }: ReceiptFormProps) {
  const [formData, setFormData] = useState<ReceiptIssueRequest>({
    ownerAddress: '',
    invoiceNo: '',
    itemName: '',
    amount: 0,
    description: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Owner Address */}
      <div className="space-y-2">
        <Label htmlFor="ownerAddress">擁有者地址 *</Label>
        <Input
          id="ownerAddress"
          name="ownerAddress"
          type="text"
          placeholder="0x..."
          value={formData.ownerAddress}
          onChange={handleInputChange}
          required
          className="font-mono"
        />
        <p className="text-xs text-gray-500">
          收據將發行給此地址的擁有者
        </p>
      </div>

      {/* Invoice Number */}
      <div className="space-y-2">
        <Label htmlFor="invoiceNo">發票號碼 *</Label>
        <Input
          id="invoiceNo"
          name="invoiceNo"
          type="text"
          placeholder="INV-2024-001"
          value={formData.invoiceNo}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Item Name */}
      <div className="space-y-2">
        <Label htmlFor="itemName">物品名稱 *</Label>
        <Input
          id="itemName"
          name="itemName"
          type="text"
          placeholder="黃金條"
          value={formData.itemName}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">金額 (TWD) *</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          placeholder="1000.00"
          value={formData.amount}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Purchase Date */}
      <div className="space-y-2">
        <Label htmlFor="purchaseDate">購買日期 *</Label>
        <Input
          id="purchaseDate"
          name="purchaseDate"
          type="date"
          value={formData.purchaseDate}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="詳細描述此資產..."
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>資產圖片</Label>
        <div className="space-y-4">
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">點擊上傳或拖拽圖片到此處</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                選擇圖片
              </Button>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ImageIcon className="h-4 w-4" />
                    <span>{formData.image?.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <p className="text-xs text-gray-500">
          支持 JPG、PNG 格式，最大 10MB
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              發行中...
            </>
          ) : (
            '發行收據'
          )}
        </Button>
      </div>
    </form>
  );
}