'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { apiService, ReceiptIssueRequest } from '@/services/apiService';
import { toast } from 'react-hot-toast';
import axios from 'axios';

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 驗證文件類型
    if (!file.type.startsWith('image/')) {
      toast.error('只支持圖片文件');
      return;
    }

    // 驗證文件大小（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('文件大小不能超過 10MB');
      return;
    }

    // 創建預覽
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 立即上傳圖片
    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await axios.post('/api/upload-image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const uploadedUrl = `http://localhost:3000${response.data.url}`;
        setImageUrl(uploadedUrl);
        setFormData(prev => ({ ...prev, image: uploadedUrl }));
        toast.success('圖片上傳成功');
      } else {
        throw new Error(response.data.error || '上傳失敗');
      }
    } catch (error: any) {
      console.error('圖片上傳錯誤:', error);
      toast.error(error.response?.data?.error || error.message || '圖片上傳失敗');
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    setImageUrl(null);
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
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    上傳中...
                  </>
                ) : (
                  '選擇圖片'
                )}
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
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ImageIcon className="h-4 w-4" />
                    <span className="truncate">{imageUrl || '上傳中...'}</span>
                  </div>
                  {imageUrl && (
                    <p className="text-xs text-green-600 mt-1">✓ 圖片已上傳並存儲</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <p className="text-xs text-gray-500">
          支持 JPG、PNG 格式，最大 10MB。點擊選擇圖片後會自動上傳到本地服務器
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