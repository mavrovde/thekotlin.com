import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

// Mock api — use jest.fn() inline to avoid hoisting issues
jest.mock('@/lib/api', () => ({
    api: {
        login: jest.fn(),
    },
}));

// Get reference after mock is set up
import { api } from '@/lib/api';
const mockLogin = api.login as jest.Mock;

import AdminLoginPage from '@/app/login/page';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(store).forEach(k => delete store[k]);
});

describe('AdminLoginPage', () => {
    it('renders login form', () => {
        render(<AdminLoginPage />);
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('admin')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByText('Sign In as Admin')).toBeInTheDocument();
    });

    it('calls login and redirects on success for admin user', async () => {
        mockLogin.mockResolvedValueOnce({
            token: 'admin_jwt',
            user: { id: 1, username: 'admin', role: 'ADMIN' },
        });

        render(<AdminLoginPage />);
        fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.submit(screen.getByText('Sign In as Admin'));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({ username: 'admin', password: 'pass' });
            expect(localStorageMock.setItem).toHaveBeenCalledWith('admin_token', 'admin_jwt');
            expect(mockPush).toHaveBeenCalledWith('/');
        });
    });

    it('shows error when user is not admin', async () => {
        mockLogin.mockResolvedValueOnce({
            token: 'user_jwt',
            user: { id: 2, username: 'user', role: 'USER' },
        });

        render(<AdminLoginPage />);
        fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.submit(screen.getByText('Sign In as Admin'));

        await waitFor(() => {
            expect(screen.getByText('Access denied. Admin role required.')).toBeInTheDocument();
        });
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('shows error on login failure', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

        render(<AdminLoginPage />);
        fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'bad' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
        fireEvent.submit(screen.getByText('Sign In as Admin'));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    it('shows loading state during submit', async () => {
        let resolveLogin: (v: unknown) => void;
        mockLogin.mockReturnValueOnce(new Promise(r => { resolveLogin = r; }));

        render(<AdminLoginPage />);
        fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.submit(screen.getByText('Sign In as Admin'));

        await waitFor(() => {
            expect(screen.getByText('Signing in...')).toBeInTheDocument();
        });

        resolveLogin!({ token: 'jwt', user: { role: 'ADMIN' } });
    });

    it('handles non-Error thrown object', async () => {
        mockLogin.mockRejectedValueOnce('string error');

        render(<AdminLoginPage />);
        fireEvent.change(screen.getByPlaceholderText('admin'), { target: { value: 'x' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'y' } });
        fireEvent.submit(screen.getByText('Sign In as Admin'));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });
});
