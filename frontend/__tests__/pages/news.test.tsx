import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { api } from '@/lib/api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
    useSearchParams: () => ({
        get: jest.fn().mockReturnValue(null),
    }),
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
    useAuth: () => ({ user: null }),
}));

// Mock api
jest.mock('@/lib/api', () => ({
    api: {
        getNews: jest.fn(),
    },
}));

const mockApi = api as jest.Mocked<typeof api>;

// Import after mocks are set up
import NewsPage from '@/app/news/page';

beforeEach(() => {
    jest.clearAllMocks();
});

describe('NewsPage', () => {
    it('renders loading state initially', () => {
        mockApi.getNews.mockReturnValue(new Promise(() => { })); // Never resolves
        render(<NewsPage />);
        expect(document.querySelector('.spinner')).toBeInTheDocument();
    });

    it('renders news cards from API', async () => {
        mockApi.getNews.mockResolvedValueOnce({
            content: [
                { id: 1, title: 'Kotlin 2.2 Released', slug: 'kotlin-22', summary: 'Big release', content: 'Full details', tag: 'Release', tagColor: '#7F52FF', sourceUrl: null, author: null, publishedAt: '2025-06-01T00:00:00', createdAt: '2025-06-01T00:00:00', updatedAt: '2025-06-01T00:00:00' },
            ],
            totalPages: 1, page: 0, size: 20, totalElements: 1,
        });

        render(<NewsPage />);

        await waitFor(() => {
            expect(screen.getByText('Kotlin 2.2 Released')).toBeInTheDocument();
        });
        expect(screen.getByText('Release')).toBeInTheDocument();
    });

    it('shows empty state when no news', async () => {
        mockApi.getNews.mockResolvedValueOnce({
            content: [],
            totalPages: 0, page: 0, size: 20, totalElements: 0,
        });

        render(<NewsPage />);

        await waitFor(() => {
            expect(screen.getByText('No news yet')).toBeInTheDocument();
        });
    });

    it('renders page heading', async () => {
        mockApi.getNews.mockResolvedValueOnce({
            content: [],
            totalPages: 0, page: 0, size: 20, totalElements: 0,
        });

        render(<NewsPage />);

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        });
    });
});
