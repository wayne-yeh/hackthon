import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NFTCard } from '@/components/NFTCard';
import { ReceiptDetails } from '@/types';

const mockReceipt: ReceiptDetails = {
  tokenId: 123,
  invoiceNo: 'INV-001',
  purchaseDate: '2024-01-01',
  amount: 100.50,
  itemName: 'Gold Bar',
  ownerAddress: '0x1234567890123456789012345678901234567890',
  metadataUri: 'ipfs://test-hash',
  metadataHash: 'test-hash',
  transactionHash: '0xabcdef123456',
  revoked: false,
  createdAt: '2024-01-01T00:00:00Z',
  revokedAt: null,
};

describe('NFTCard', () => {
  it('renders receipt information correctly', () => {
    render(<NFTCard receipt={mockReceipt} />);
    
    expect(screen.getByText('Gold Bar')).toBeInTheDocument();
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('有效')).toBeInTheDocument();
    expect(screen.getByText('#123')).toBeInTheDocument();
  });

  it('renders revoked receipt correctly', () => {
    const revokedReceipt = { ...mockReceipt, revoked: true };
    render(<NFTCard receipt={revokedReceipt} />);
    
    expect(screen.getByText('已撤銷')).toBeInTheDocument();
  });

  it('calls onVerify when verify button is clicked', () => {
    const mockOnVerify = jest.fn();
    render(<NFTCard receipt={mockReceipt} onVerify={mockOnVerify} />);
    
    const verifyButton = screen.getByText('驗證');
    fireEvent.click(verifyButton);
    
    expect(mockOnVerify).toHaveBeenCalledWith(123);
  });

  it('calls onViewDetails when details button is clicked', () => {
    const mockOnViewDetails = jest.fn();
    render(<NFTCard receipt={mockReceipt} onViewDetails={mockOnViewDetails} />);
    
    const detailsButton = screen.getByText('詳情');
    fireEvent.click(detailsButton);
    
    expect(mockOnViewDetails).toHaveBeenCalledWith(123);
  });

  it('does not show verify button for revoked receipts', () => {
    const revokedReceipt = { ...mockReceipt, revoked: true };
    const mockOnVerify = jest.fn();
    render(<NFTCard receipt={revokedReceipt} onVerify={mockOnVerify} />);
    
    expect(screen.queryByText('驗證')).not.toBeInTheDocument();
  });
});
