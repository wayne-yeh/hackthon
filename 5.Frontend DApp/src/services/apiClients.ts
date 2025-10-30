import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ReceiptData,
  ReceiptIssueResponse,
  ReceiptVerifyRequest,
  ReceiptVerifyResponse,
  ReceiptDetails,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8083';
    
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add API key for protected endpoints
    this.client.interceptors.request.use((config) => {
      const apiKey = process.env.NEXT_PUBLIC_ISSUER_TOKEN;
      if (apiKey && this.isProtectedEndpoint(config.url || '')) {
        config.headers['X-API-Key'] = apiKey;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  private isProtectedEndpoint(url: string): boolean {
    const protectedEndpoints = ['/issue', '/revoke', '/owner'];
    return protectedEndpoints.some(endpoint => url.includes(endpoint));
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.client.get('/actuator/health');
    return response.data;
  }

  // Issue a new receipt
  async issueReceipt(data: ReceiptData): Promise<ReceiptIssueResponse> {
    const response: AxiosResponse<ReceiptIssueResponse> = await this.client.post(
      '/api/v1/receipts/issue',
      data
    );
    return response.data;
  }

  // Verify a receipt
  async verifyReceipt(request: ReceiptVerifyRequest): Promise<ReceiptVerifyResponse> {
    const response: AxiosResponse<ReceiptVerifyResponse> = await this.client.post(
      '/api/v1/receipts/verify',
      request
    );
    return response.data;
  }

  // Get receipt details
  async getReceiptDetails(tokenId: number): Promise<ReceiptDetails> {
    const response: AxiosResponse<ReceiptDetails> = await this.client.get(
      `/api/v1/receipts/${tokenId}/details`
    );
    return response.data;
  }

  // Revoke a receipt
  async revokeReceipt(tokenId: number): Promise<string> {
    const response: AxiosResponse<string> = await this.client.post(
      `/api/v1/receipts/${tokenId}/revoke`
    );
    return response.data;
  }

  // Get all receipts for an owner
  async getOwnerReceipts(address: string): Promise<ReceiptDetails[]> {
    const response: AxiosResponse<ReceiptDetails[]> = await this.client.get(
      `/api/v1/receipts/owner/${address}`
    );
    return response.data;
  }

  // Get active receipts for an owner
  async getOwnerActiveReceipts(address: string): Promise<ReceiptDetails[]> {
    const response: AxiosResponse<ReceiptDetails[]> = await this.client.get(
      `/api/v1/receipts/owner/${address}/active`
    );
    return response.data;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export individual methods for convenience
export const {
  healthCheck,
  issueReceipt,
  verifyReceipt,
  getReceiptDetails,
  revokeReceipt,
  getOwnerReceipts,
  getOwnerActiveReceipts,
} = apiClient;










