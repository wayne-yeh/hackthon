export interface ReceiptData {
  invoiceNo: string;
  purchaseDate: string;
  amount: number;
  itemName: string;
  ownerAddress: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ReceiptIssueResponse {
  tokenId: number;
  transactionHash: string;
  metadataUri: string;
  metadataHash: string;
  ownerAddress: string;
  success: boolean;
  message: string;
}

export interface ReceiptVerifyRequest {
  tokenId: number;
  metadataHash: string;
}

export interface ReceiptVerifyResponse {
  valid: boolean;
  tokenId: number;
  ownerAddress: string;
  revoked: boolean;
  metadataHash: string;
  hashMatches: boolean;
  message: string;
  verifiedAt: string;
}

export interface ReceiptDetails {
  tokenId: number;
  invoiceNo: string;
  purchaseDate: string;
  amount: number;
  itemName: string;
  ownerAddress: string;
  metadataUri: string;
  metadataHash: string;
  transactionHash: string;
  revoked: boolean;
  createdAt: string;
  revokedAt: string | null;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: any;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}











