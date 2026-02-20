import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import WelcomeNews from '@/components/WelcomeNews';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
    api: {
        getNews: jest.fn(),
    },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('WelcomeNews', () => {
    it('fetches and renders news cards', async () => {
        const mockNews = {
            content: [
                { id: 1, title: 'Kotlin 2.2', slug: 'kotlin-22', summary: 'Big release', tag: 'Release', tagColor: '#7F52FF', sourceUrl: null, author: null, publishedAt: '2025-06-01T00:00:00', createdAt: '2025-06-01T00:00:00', updatedAt: '2025-06-01T00:00:00' },
                { id: 2, title: 'Spring Boot 4', slug: 'spring-boot-4', summary: 'New features', tag: 'Framework', tagColor: '#6DB33F', sourceUrl: null, author: null, publishedAt: '2025-05-15T00:00:00', createdAt: '2025-05-15T00:00:00', updatedAt: '2025-05-15T00:00:00' },
            ],
            totalPages: 1,
            page: 0,
            size: 4,
            totalElements: 2,
        };
        mockApi.getNews.mockResolvedValueOnce(mockNews);

        render(<WelcomeNews />);

        await waitFor(() => {
            expect(screen.getByText('Kotlin 2.2')).toBeInTheDocument();
            expect(screen.getByText('Spring Boot 4')).toBeInTheDocument();
        });

        expect(screen.getByText('Release')).toBeInTheDocument();
        expect(screen.getByText('Framework')).toBeInTheDocument();
    });

    it('renders nothing when no news available', async () => {
        mockApi.getNews.mockResolvedValueOnce({
            content: [],
            totalPages: 0,
            page: 0,
            size: 4,
            totalElements: 0,
        });

        const { container } = render(<WelcomeNews />);

        await waitFor(() => {
            expect(mockApi.getNews).toHaveBeenCalled();
        });

        // Component should render nothing (null) when no news
        // Wait a tick for state to settle
        await new Promise(r => setTimeout(r, 50));
        expect(container.innerHTML).toBe('');
    });

    it('renders "View all news" link', async () => {
        mockApi.getNews.mockResolvedValueOnce({
            content: [
                { id: 1, title: 'Test News', slug: 'test', summary: 'Sum', tag: 'Test', tagColor: '#000', sourceUrl: null, author: null, publishedAt: '2025-06-01T00:00:00', createdAt: '2025-06-01T00:00:00', updatedAt: '2025-06-01T00:00:00' },
            ],
            totalPages: 1, page: 0, size: 4, totalElements: 1,
        });

        render(<WelcomeNews />);

        await waitFor(() => {
            expect(screen.getByText('All News →')).toBeInTheDocument();
        });
    });
});
