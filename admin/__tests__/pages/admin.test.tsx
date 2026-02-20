import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Mock next/navigation
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
}));

// Mock api
jest.mock('@/lib/api', () => ({
    api: {
        getMe: jest.fn(),
        getStats: jest.fn(),
        getArticles: jest.fn(),
        getCategories: jest.fn(),
        getThreads: jest.fn(),
    },
}));

import { api } from '@/lib/api';
const mockGetMe = api.getMe as jest.Mock;
const mockGetStats = api.getStats as jest.Mock;
const mockGetArticles = api.getArticles as jest.Mock;
const mockGetCategories = api.getCategories as jest.Mock;
const mockGetThreads = api.getThreads as jest.Mock;

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

import AdminPage from '@/app/page';

const adminUser = {
    id: 1, username: 'admin', displayName: 'Admin User', role: 'ADMIN',
    email: 'a@t.com', bio: null, avatarUrl: null, createdAt: '2025-01-01',
};

function setupDefaults() {
    localStorageMock.getItem.mockImplementation((key: string) => store[key] || null);
    localStorageMock.setItem.mockImplementation((key: string, value: string) => { store[key] = value; });
    localStorageMock.removeItem.mockImplementation((key: string) => { delete store[key]; });
    mockGetStats.mockResolvedValue({ articleCount: 10, categoryCount: 3, threadCount: 7, userCount: 5 });
    mockGetArticles.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0 });
    mockGetCategories.mockResolvedValue([]);
    mockGetThreads.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0 });
}

beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(store).forEach(k => delete store[k]);
    setupDefaults();
});

async function renderAdminAuthenticated() {
    store['admin_token'] = 'admin_token';
    mockGetMe.mockResolvedValue(adminUser);
    await act(async () => { render(<AdminPage />); });
    await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument();
    });
}

function clickSidebarLink(name: string) {
    // Find sidebar links by their class pattern
    const links = document.querySelectorAll('.sidebar-link');
    const link = Array.from(links).find(el => el.textContent?.includes(name));
    if (!link) throw new Error(`Sidebar link "${name}" not found`);
    fireEvent.click(link);
}

describe('AdminPage — Auth guard', () => {
    it('redirects to /login when no token', () => {
        render(<AdminPage />);
        expect(mockReplace).toHaveBeenCalledWith('/login');
    });

    it('redirects when getMe fails', async () => {
        store['admin_token'] = 'expired_token';
        mockGetMe.mockRejectedValueOnce(new Error('Unauthorized'));
        await act(async () => { render(<AdminPage />); });
        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith('/login');
        });
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('admin_token');
    });

    it('redirects non-admin users', async () => {
        store['admin_token'] = 'user_token';
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
        mockGetMe.mockResolvedValueOnce({ id: 1, username: 'user', role: 'USER' });
        await act(async () => { render(<AdminPage />); });
        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Access denied. Admin role required.');
            expect(mockReplace).toHaveBeenCalledWith('/login');
        });
        alertSpy.mockRestore();
    });

    it('renders admin layout for admin user', async () => {
        await renderAdminAuthenticated();
        expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
});

describe('AdminPage — Sidebar', () => {
    it('renders all nav links', async () => {
        await renderAdminAuthenticated();
        const sidebar = document.querySelector('.sidebar-nav')!;
        expect(sidebar.textContent).toContain('Dashboard');
        expect(sidebar.textContent).toContain('Articles');
        expect(sidebar.textContent).toContain('Categories');
        expect(sidebar.textContent).toContain('Forum Threads');
        expect(sidebar.textContent).toContain('Users');
    });

    it('renders user avatar initial and role', async () => {
        await renderAdminAuthenticated();
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });

    it('Sign Out clears token', async () => {
        await renderAdminAuthenticated();
        fireEvent.click(screen.getByText('Sign Out'));
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('admin_token');
    });
});

describe('AdminPage — Dashboard', () => {
    it('renders stats cards', async () => {
        await renderAdminAuthenticated();
        await waitFor(() => {
            expect(screen.getByText('10')).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByText('7')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
        });
    });

    it('renders Quick Actions', async () => {
        await renderAdminAuthenticated();
        await waitFor(() => {
            expect(screen.getByText('Quick Actions')).toBeInTheDocument();
        });
    });
});

describe('AdminPage — Navigation', () => {
    it('navigates to Articles page', async () => {
        await renderAdminAuthenticated();
        await act(async () => { clickSidebarLink('Articles'); });
        await waitFor(() => {
            expect(screen.getByText('All Articles')).toBeInTheDocument();
        });
    });

    it('navigates to Categories page', async () => {
        await renderAdminAuthenticated();
        await act(async () => { clickSidebarLink('Categories'); });
        await waitFor(() => {
            expect(screen.getByText('All Categories')).toBeInTheDocument();
        });
    });

    it('navigates to Users page', async () => {
        await renderAdminAuthenticated();
        await act(async () => { clickSidebarLink('Users'); });
        await waitFor(() => {
            expect(screen.getByText('User management API endpoints coming soon.')).toBeInTheDocument();
        });
    });
});

describe('AdminPage — Articles sub-page', () => {
    it('renders articles table with data', async () => {
        mockGetArticles.mockResolvedValue({
            content: [{
                id: 1, title: 'Test Article', slug: 'test', summary: 'Sum',
                author: { id: 1, username: 'author', displayName: 'Author', email: 'a@t.com', bio: null, avatarUrl: null, role: 'USER', createdAt: '2025-01-01' },
                category: { id: 1, name: 'Kotlin', slug: 'kotlin', description: null, icon: '🟣' },
                tags: [], viewCount: 42, createdAt: '2025-06-01T00:00:00',
            }],
            totalElements: 1,
        });

        await renderAdminAuthenticated();
        await act(async () => { clickSidebarLink('Articles'); });
        await waitFor(() => {
            expect(screen.getByText('Test Article')).toBeInTheDocument();
        });
    });

    it('shows empty state when no articles', async () => {
        await renderAdminAuthenticated();
        await act(async () => { clickSidebarLink('Articles'); });
        await waitFor(() => {
            expect(screen.getByText('No articles found')).toBeInTheDocument();
        });
    });
});
