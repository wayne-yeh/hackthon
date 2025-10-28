import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VerifyBadge } from '@/components/VerifyBadge';

describe('VerifyBadge', () => {
  it('renders loading state correctly', () => {
    render(<VerifyBadge isValid={null} isLoading={true} />);
    expect(screen.getByText('驗證中...')).toBeInTheDocument();
  });

  it('renders valid state correctly', () => {
    render(<VerifyBadge isValid={true} />);
    expect(screen.getByText('有效')).toBeInTheDocument();
  });

  it('renders invalid state correctly', () => {
    render(<VerifyBadge isValid={false} />);
    expect(screen.getByText('無效')).toBeInTheDocument();
  });

  it('renders revoked state correctly', () => {
    render(<VerifyBadge isValid={true} isRevoked={true} />);
    expect(screen.getByText('已撤銷')).toBeInTheDocument();
  });

  it('renders unverified state correctly', () => {
    render(<VerifyBadge isValid={null} />);
    expect(screen.getByText('未驗證')).toBeInTheDocument();
  });
});









