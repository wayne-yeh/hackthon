'use client';

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8083';

export interface ReceiptIssueRequest {
  invoiceNo: string;
  purchaseDate: string;
  amount: number;
  itemName: string;
  ownerAddress: string;
  description?: string;
  image?: File | null;
  metadata?: Record<string, any>;
}

export interface ReceiptIssueResponse {
  tokenId: number;
  transactionHash: string;
  message: string;
}

export interface ReceiptDetails {
  tokenId: number;
  invoiceNo: string;
  itemName: string;
  amount: number;
  ownerAddress: string;
  purchaseDate: string;
  description?: string;
  valid?: boolean;
  revoked: boolean;
  metadataUri?: string;
  metadataHash?: string;
  transactionHash?: string;
  createdAt?: string;
  revokedAt?: string | null;
}

export interface VerificationRequest {
  tokenId: number;
  metadataHash: string; // Required for verification API
}

export interface VerificationResponse {
  valid: boolean;
  tokenId: number | null;
  ownerAddress: string | null;
  revoked: boolean;
  metadataHash: string | null;
  hashMatches: boolean;
  message: string;
  verifiedAt: string;
}

class ApiService {
  private apiKey = process.env.NEXT_PUBLIC_API_KEY || 'change-this-in-production';

  async issueReceipt(data: ReceiptIssueRequest): Promise<ReceiptIssueResponse> {
    try {
      // Convert image file to base64 if provided
      let requestData: any = {
        invoiceNo: data.invoiceNo,
        purchaseDate: data.purchaseDate,
        amount: data.amount,
        itemName: data.itemName,
        ownerAddress: data.ownerAddress,
      };

      // Add description if provided
      if (data.description) {
        requestData.description = data.description;
      }

      // Convert image file to base64 if provided
      if (data.image) {
        requestData.imageBase64 = await this.fileToBase64(data.image);
      }

      const response = await axios.post(`${API_BASE_URL}/api/v1/receipts/issue`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Issue receipt error:', error);
      throw new Error(error.response?.data?.message || '發行收據失敗');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  async verifyReceipt(data: VerificationRequest): Promise<VerificationResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/receipts/verify`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Verify receipt error:', error);
      throw new Error(error.response?.data?.message || '驗證收據失敗');
    }
  }

  async getReceiptDetails(tokenId: number): Promise<ReceiptDetails> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/receipts/${tokenId}/details`);
      return response.data;
    } catch (error: any) {
      console.error('Get receipt details error:', error);
      throw new Error(error.response?.data?.message || '獲取收據詳情失敗');
    }
  }

  async getOwnerReceipts(ownerAddress: string): Promise<ReceiptDetails[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/receipts/owner/${ownerAddress}`, {
        headers: {
          'X-API-Key': this.apiKey,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get owner receipts error:', error);
      throw new Error(error.response?.data?.message || '獲取收據列表失敗');
    }
  }

  async revokeReceipt(tokenId: number): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/api/v1/receipts/${tokenId}/revoke`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
      });
    } catch (error: any) {
      console.error('Revoke receipt error:', error);
      throw new Error(error.response?.data?.message || '撤銷收據失敗');
    }
  }

  async uploadMetadata(formData: FormData): Promise<{ url: string; hash: string }> {
    try {
      const response = await axios.post('http://localhost:8081/api/metadata/receipts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Upload metadata error:', error);
      throw new Error(error.response?.data?.message || '上傳元數據失敗');
    }
  }
}

export const apiService = new ApiService();
