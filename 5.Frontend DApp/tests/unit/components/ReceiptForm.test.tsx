import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { ReceiptForm } from '@/components/ReceiptForm';
import { ReceiptData } from '@/types';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ReceiptForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all form fields', () => {
    render(<ReceiptForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/發票號碼/)).toBeInTheDocument();
    expect(screen.getByLabelText(/購買日期/)).toBeInTheDocument();
    expect(screen.getByLabelText(/金額/)).toBeInTheDocument();
    expect(screen.getByLabelText(/商品名稱/)).toBeInTheDocument();
    expect(screen.getByLabelText(/擁有者地址/)).toBeInTheDocument();
    expect(screen.getByLabelText(/描述/)).toBeInTheDocument();
    expect(screen.getByLabelText(/商品圖片/)).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    render(<ReceiptForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByText('發行收據');
    await user.click(submitButton);
    
    expect(screen.getByText('發票號碼為必填項目')).toBeInTheDocument();
    expect(screen.getByText('購買日期為必填項目')).toBeInTheDocument();
    expect(screen.getByText('金額為必填項目')).toBeInTheDocument();
    expect(screen.getByText('商品名稱為必填項目')).toBeInTheDocument();
    expect(screen.getByText('擁有者地址為必填項目')).toBeInTheDocument();
  });

  it('validates Ethereum address format', async () => {
    const user = userEvent.setup();
    render(<ReceiptForm onSubmit={mockOnSubmit} />);
    
    const addressInput = screen.getByLabelText(/擁有者地址/);
    await user.type(addressInput, 'invalid-address');
    
    const submitButton = screen.getByText('發行收據');
    await user.click(submitButton);
    
    expect(screen.getByText('請輸入有效的以太坊地址')).toBeInTheDocument();
  });

  it('validates amount is greater than 0', async () => {
    const user = userEvent.setup();
    render(<ReceiptForm onSubmit={mockOnSubmit} />);
    
    const amountInput = screen.getByLabelText(/金額/);
    await user.type(amountInput, '0');
    
    const submitButton = screen.getByText('發行收據');
    await user.click(submitButton);
    
    expect(screen.getByText('金額必須大於 0')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<ReceiptForm onSubmit={mockOnSubmit} />);
    
    const formData: ReceiptData = {
      invoiceNo: 'INV-001',
      purchaseDate: '2024-01-01',
      amount: 100.50,
      itemName: 'Gold Bar',
      ownerAddress: '0x1234567890123456789012345678901234567890',
      description: 'Test description',
    };

    await user.type(screen.getByLabelText(/發票號碼/), formData.invoiceNo);
    await user.type(screen.getByLabelText(/購買日期/), formData.purchaseDate);
    await user.type(screen.getByLabelText(/金額/), formData.amount.toString());
    await user.type(screen.getByLabelText(/商品名稱/), formData.itemName);
    await user.type(screen.getByLabelText(/擁有者地址/), formData.ownerAddress);
    await user.type(screen.getByLabelText(/描述/), formData.description);

    const submitButton = screen.getByText('發行收據');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(formData);
    });
  });

  it('shows loading state when submitting', async () => {
    const user = userEvent.setup();
    render(<ReceiptForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    expect(screen.getByText('發行中...')).toBeInTheDocument();
    expect(screen.getByText('發行中...')).toBeDisabled();
  });

  it('handles image upload', async () => {
    const user = userEvent.setup();
    render(<ReceiptForm onSubmit={mockOnSubmit} />);
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/商品圖片/);
    
    await user.upload(fileInput, file);
    
    expect(fileInput.files[0]).toBe(file);
  });
});









