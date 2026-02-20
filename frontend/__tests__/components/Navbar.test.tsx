import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    usePathname: jest.fn().mockReturnValue('/welcome'),
}));

// Mock auth
const mockUseAuth = jest.fn();
jest.mock('@/lib/auth', () => ({
    useAuth: () => mockUseAuth(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Navbar', () => {
    it('renders all nav links', () => {
        mockUseAuth.mockReturnValue({ user: null, logout: jest.fn() });
        render(<Navbar />);

        expect(screen.getByText('Welcome')).toBeInTheDocument();
        expect(screen.getByText('News')).toBeInTheDocument();
        expect(screen.getByText('Articles')).toBeInTheDocument();
        expect(screen.getByText('Forum')).toBeInTheDocument();
        expect(screen.getByText('Topics')).toBeInTheDocument();
    });

    it('renders Sign In / Sign Up when unauthenticated', () => {
        mockUseAuth.mockReturnValue({ user: null, logout: jest.fn() });
        render(<Navbar />);

        expect(screen.getByText('Sign In')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('renders user name + Sign Out when authenticated', () => {
        mockUseAuth.mockReturnValue({
            user: { username: 'testuser', displayName: 'Test User' },
            logout: jest.fn(),
        });
        render(<Navbar />);

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
        expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    it('falls back to username when displayName is null', () => {
        mockUseAuth.mockReturnValue({
            user: { username: 'fallback_user', displayName: null },
            logout: jest.fn(),
        });
        render(<Navbar />);

        expect(screen.getByText('fallback_user')).toBeInTheDocument();
    });

    it('renders TheKotlin brand logo link', () => {
        mockUseAuth.mockReturnValue({ user: null, logout: jest.fn() });
        render(<Navbar />);

        expect(screen.getByText('TheKotlin')).toBeInTheDocument();
    });
});
