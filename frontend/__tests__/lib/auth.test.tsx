import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

// Mock the api module
jest.mock('@/lib/api', () => ({
    api: {
        getMe: jest.fn(),
        login: jest.fn(),
        register: jest.fn(),
    },
}));

const mockApi = api as jest.Mocked<typeof api>;

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

// Test component that exposes auth context
function TestConsumer({ onRender }: { onRender: (ctx: ReturnType<typeof useAuth>) => void }) {
    const ctx = useAuth();
    onRender(ctx);
    return (
        <div>
            <span data-testid="loading">{String(ctx.loading)}</span>
            <span data-testid="user">{ctx.user?.username || 'none'}</span>
            <button data-testid="login" onClick={() => ctx.login('test', 'pass')}>Login</button>
            <button data-testid="logout" onClick={() => ctx.logout()}>Logout</button>
        </div>
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(store).forEach(k => delete store[k]);
});

describe('AuthProvider', () => {
    it('initializes with loading state then resolves', async () => {
        const onRender = jest.fn();
        render(
            <AuthProvider>
                <TestConsumer onRender={onRender} />
            </AuthProvider>
        );

        // Initially loading
        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
        });
    });

    it('restores token from localStorage and fetches user', async () => {
        store['token'] = 'saved_token';
        const mockUser = { id: 1, username: 'restored', email: 'r@t.com', displayName: null, bio: null, avatarUrl: null, role: 'USER', createdAt: '2025-01-01' };
        mockApi.getMe.mockResolvedValueOnce(mockUser);

        render(
            <AuthProvider>
                <TestConsumer onRender={() => { }} />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('restored');
        });
    });

    it('clears invalid token when getMe fails', async () => {
        store['token'] = 'invalid_token';
        mockApi.getMe.mockRejectedValueOnce(new Error('Unauthorized'));

        render(
            <AuthProvider>
                <TestConsumer onRender={() => { }} />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('none');
        });
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });

    it('login stores token and sets user', async () => {
        const mockResponse = {
            token: 'new_token',
            user: { id: 1, username: 'logged', email: 'l@t.com', displayName: 'Logged', bio: null, avatarUrl: null, role: 'USER', createdAt: '2025-01-01' },
        };
        mockApi.login.mockResolvedValueOnce(mockResponse);

        render(
            <AuthProvider>
                <TestConsumer onRender={() => { }} />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
        });

        await act(async () => {
            screen.getByTestId('login').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('logged');
        });
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new_token');
    });

    it('logout clears token and user', async () => {
        store['token'] = 'existing';
        const mockUser = { id: 1, username: 'existing', email: 'e@t.com', displayName: null, bio: null, avatarUrl: null, role: 'USER', createdAt: '2025-01-01' };
        mockApi.getMe.mockResolvedValueOnce(mockUser);

        render(
            <AuthProvider>
                <TestConsumer onRender={() => { }} />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('existing');
        });

        await act(async () => {
            screen.getByTestId('logout').click();
        });

        expect(screen.getByTestId('user').textContent).toBe('none');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
});

describe('useAuth', () => {
    it('throws when used outside AuthProvider', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => { });
        expect(() => {
            render(<TestConsumer onRender={() => { }} />);
        }).toThrow('useAuth must be used within AuthProvider');
        spy.mockRestore();
    });
});
