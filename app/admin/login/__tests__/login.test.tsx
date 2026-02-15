/**
 * Admin Login Page Tests
 * 
 * Tests authentication error handling and user feedback for the admin login page.
 * Verifies that authentication errors are properly displayed to users.
 * 
 * Requirements: 12.2
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import AdminLoginPage from '../page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useAuth hook
jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('AdminLoginPage - Error Handling', () => {
  const mockPush = jest.fn();
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('displays authentication error when login fails with invalid credentials', async () => {
    // Setup: Mock useAuth to return an error state
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: 'Invalid email or password.',
      login: mockLogin,
      logout: jest.fn(),
      clearError: mockClearError,
    });

    render(<AdminLoginPage />);

    // Verify error message is displayed
    expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
  });

  it('displays error when user account is disabled', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: 'This account has been disabled.',
      login: mockLogin,
      logout: jest.fn(),
      clearError: mockClearError,
    });

    render(<AdminLoginPage />);

    expect(screen.getByText('This account has been disabled.')).toBeInTheDocument();
  });

  it('displays error when too many login attempts are made', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: 'Too many failed login attempts. Please try again later.',
      login: mockLogin,
      logout: jest.fn(),
      clearError: mockClearError,
    });

    render(<AdminLoginPage />);

    expect(screen.getByText('Too many failed login attempts. Please try again later.')).toBeInTheDocument();
  });

  it('clears error when user starts typing after an error', async () => {
    // First render with error
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: 'Invalid email or password.',
      login: mockLogin,
      logout: jest.fn(),
      clearError: mockClearError,
    });

    const { rerender } = render(<AdminLoginPage />);

    // Verify error is shown
    expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();

    // Simulate form submission which clears error
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Mock successful state after clearing error
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      logout: jest.fn(),
      clearError: mockClearError,
    });

    fireEvent.click(submitButton);

    // Verify clearError was called
    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  it('validates form and shows validation error for empty email', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      logout: jest.fn(),
      clearError: mockClearError,
    });

    render(<AdminLoginPage />);

    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill password but leave email empty
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(submitButton.closest('form')!);

    // Login should not be called due to validation
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('validates form and shows validation error for invalid email format', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      logout: jest.fn(),
      clearError: mockClearError,
    });

    render(<AdminLoginPage />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(submitButton.closest('form')!);

    // Login should not be called due to validation
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows loading state during authentication', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      error: null,
      login: mockLogin,
      logout: jest.fn(),
      clearError: mockClearError,
    });

    render(<AdminLoginPage />);

    // Should show loading spinner, not the form
    expect(screen.queryByPlaceholderText('Email address')).not.toBeInTheDocument();
  });

  it('disables form inputs and button during submission', async () => {
    const mockLoginPromise = new Promise(() => {}); // Never resolves to keep loading state
    mockLogin.mockReturnValue(mockLoginPromise);

    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      logout: jest.fn(),
      clearError: mockClearError,
    });

    render(<AdminLoginPage />);

    const emailInput = screen.getByPlaceholderText('Email address') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign in/i }) as HTMLButtonElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput.disabled).toBe(true);
      expect(passwordInput.disabled).toBe(true);
      expect(submitButton.disabled).toBe(true);
    });
  });
});
