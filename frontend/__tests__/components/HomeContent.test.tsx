import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HomeContent from '@/components/HomeContent';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
    api: {
        getArticles: jest.fn(),
        getCategories: jest.fn(),
        getStats: jest.fn(),
    },
}));

describe('HomeContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders stats, categories, and articles', async () => {
        (api.getStats as jest.Mock).mockResolvedValue({
            articleCount: 10,
            categoryCount: 5,
            threadCount: 20,
            userCount: 50,
        });

        (api.getCategories as jest.Mock).mockResolvedValue([
            { id: 1, name: 'Kotlin', slug: 'kotlin', description: 'Kotlin topics', icon: '🟣' }
        ]);

        (api.getArticles as jest.Mock).mockResolvedValue({
            content: [
                {
                    id: 1,
                    title: 'Kotlin 1.9',
                    slug: 'kotlin-1-9',
                    summary: 'New features in Kotlin 1.9',
                    author: { username: 'testuser', displayName: 'Test User' },
                    category: { name: 'Kotlin', icon: '🟣' },
                    tags: [{ id: 1, name: 'Release' }],
                    createdAt: '2023-07-06T00:00:00Z',
                }
            ]
        });

        render(<HomeContent />);

        await waitFor(() => {
            expect(screen.getByText('Articles')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
            expect(screen.getByText('Kotlin topics')).toBeInTheDocument();
            expect(screen.getByText('Kotlin 1.9')).toBeInTheDocument();
        });
    });
    
    it('handles api errors gracefully', async () => {
        (api.getStats as jest.Mock).mockRejectedValue(new Error('Network error'));
        (api.getCategories as jest.Mock).mockRejectedValue(new Error('Network error'));
        (api.getArticles as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { container } = render(<HomeContent />);

        await waitFor(() => {
            // Stats should not render, meaning it's gracefully handled
            expect(container.querySelector('.stats-bar')).toBeNull();
        });
    });
});
