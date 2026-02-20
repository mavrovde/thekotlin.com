import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

// Mock auth
const mockLogin = jest.fn();
jest.mock('@/lib/auth', () => ({
    useAuth: () => ({
        login: mockLogin,
    }),
}));

// Import after mocks
import SignInPage from '@/app/auth/signin/page';

beforeEach(() => {
    jest.clearAllMocks();
});

describe('SignInPage', () => {
    it('renders sign-in form', () => {
        render(<SignInPage />);
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('your-username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByText('Sign In', { selector: 'button[type="submit"]' })).toBeInTheDocument();
    });

    it('shows error on failed login', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

        render(<SignInPage />);
        fireEvent.change(screen.getByPlaceholderText('your-username'), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
        fireEvent.submit(screen.getByText('Sign In', { selector: 'button[type="submit"]' }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    it('calls login and redirects on success', async () => {
        mockLogin.mockResolvedValueOnce(undefined);

        render(<SignInPage />);
        fireEvent.change(screen.getByPlaceholderText('your-username'), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.submit(screen.getByText('Sign In', { selector: 'button[type="submit"]' }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('user', 'pass');
            expect(mockPush).toHaveBeenCalledWith('/');
        });
    });

    it('shows loading state during submit', async () => {
        let resolveLogin: () => void;
        mockLogin.mockReturnValueOnce(new Promise<void>(r => { resolveLogin = r; }));

        render(<SignInPage />);
        fireEvent.change(screen.getByPlaceholderText('your-username'), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.submit(screen.getByText('Sign In', { selector: 'button[type="submit"]' }));

        await waitFor(() => {
            expect(screen.getByText('Signing in...')).toBeInTheDocument();
        });

        // Resolve to avoid pending promise warnings
        resolveLogin!();
    });

    it('renders OAuth buttons', () => {
        render(<SignInPage />);
        expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
        expect(screen.getByText('Sign in with Apple')).toBeInTheDocument();
    });

    it('OAuth buttons show alert', () => {
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
        render(<SignInPage />);
        fireEvent.click(screen.getByText('Sign in with Google'));
        expect(alertSpy).toHaveBeenCalledWith('Sign in with Google is coming soon!');
        alertSpy.mockRestore();
    });

    it('renders sign-up link', () => {
        render(<SignInPage />);
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
});
