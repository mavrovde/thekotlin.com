import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForumPage from '@/app/forum/page';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

jest.mock('@/lib/api', () => ({
    api: {
        getThreads: jest.fn()
    }
}));

jest.mock('@/lib/auth', () => ({
    useAuth: jest.fn()
}));

const mockGetThreads = api.getThreads as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;

describe('ForumPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({ user: null });
    });

    it('renders loading state initially', async () => {
        mockGetThreads.mockImplementation(() => new Promise(() => {})); // Never resolves
        render(<ForumPage />);
        expect(screen.getByText('Community Forum')).toBeInTheDocument();
        // Since we have a spinner div
        expect(document.querySelector('.loading-page')).toBeInTheDocument();
    });

    it('renders empty state when no threads', async () => {
        mockGetThreads.mockResolvedValueOnce({ content: [], totalPages: 0 });
        render(<ForumPage />);
        
        await waitFor(() => {
            expect(screen.getByText('No discussions yet')).toBeInTheDocument();
        });
    });

    it('renders threads list', async () => {
        const mockThreads = [
            {
                id: 1,
                title: 'Test Thread Pinned',
                author: { username: 'user1', displayName: 'User One' },
                category: { name: 'General', icon: '📝' },
                createdAt: new Date().toISOString(),
                postCount: 5,
                viewCount: 100,
                isPinned: true
            },
            {
                id: 2,
                title: 'Test Thread Normal',
                author: { username: 'user2' }, // no display name
                createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5h ago
                postCount: 2,
                viewCount: 50,
                isPinned: false
            }
        ];
        
        mockGetThreads.mockResolvedValueOnce({ content: mockThreads, totalPages: 1 });
        render(<ForumPage />);

        await waitFor(() => {
            expect(screen.getByText('Test Thread Pinned')).toBeInTheDocument();
        });

        expect(screen.getByText('Test Thread Normal')).toBeInTheDocument();
        expect(screen.getByText('📌 Pinned')).toBeInTheDocument();
        expect(screen.getByText('by User One')).toBeInTheDocument();
        expect(screen.getByText('📝 General')).toBeInTheDocument();
        expect(screen.getByText('by user2')).toBeInTheDocument();
        expect(screen.getByText('just now')).toBeInTheDocument();
        expect(screen.getByText('5h ago')).toBeInTheDocument();
        
        // Link hrefs
        expect(screen.getByRole('link', { name: /Test Thread Pinned/ })).toHaveAttribute('href', '/forum/1');
    });

    it('shows New Thread button if user is authenticated', async () => {
        mockUseAuth.mockReturnValue({ user: { id: 1, username: 'tester' } });
        mockGetThreads.mockResolvedValueOnce({ content: [], totalPages: 0 });
        
        render(<ForumPage />);
        expect(screen.getByText('+ New Thread')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '+ New Thread' })).toHaveAttribute('href', '/forum/new');
    });

    it('formats older dates correctly', async () => {
        const daysAgo = new Date(Date.now() - 3600000 * 24 * 3).toISOString(); // 3 days ago
        const longAgo = new Date('2023-01-01T12:00:00Z').toISOString();
        
        const mockThreads = [
            {
                id: 1, title: 'T1', author: { username: 'u' }, createdAt: daysAgo, postCount: 0, viewCount: 0 
            },
            {
                id: 2, title: 'T2', author: { username: 'u' }, createdAt: longAgo, postCount: 0, viewCount: 0 
            }
        ];
        
        mockGetThreads.mockResolvedValueOnce({ content: mockThreads, totalPages: 1 });
        render(<ForumPage />);

        await waitFor(() => {
            expect(screen.getByText('3d ago')).toBeInTheDocument();
            expect(screen.getByText('Jan 1')).toBeInTheDocument();
        });
    });

    it('handles pagination', async () => {
        mockGetThreads.mockResolvedValueOnce({ content: [{ id: 1, title: 'Page 1 Thread', author: { username: 'u' }, createdAt: new Date().toISOString() }], totalPages: 3 });
        
        render(<ForumPage />);
        
        await waitFor(() => {
            expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
        });

        const nextBtn = screen.getByText('Next →');
        const prevBtn = screen.getByText('← Previous');

        expect(prevBtn).toBeDisabled();
        expect(nextBtn).not.toBeDisabled();

        // Go to page 2 (index 1)
        mockGetThreads.mockResolvedValueOnce({ content: [], totalPages: 3 });
        await userEvent.click(nextBtn);

        await waitFor(() => {
            expect(mockGetThreads).toHaveBeenCalledWith(1);
            expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
        });

        expect(prevBtn).not.toBeDisabled();
        
        // Go to page 3 (index 2)
        mockGetThreads.mockResolvedValueOnce({ content: [], totalPages: 3 });
        await userEvent.click(nextBtn);

        await waitFor(() => {
            expect(mockGetThreads).toHaveBeenCalledWith(2);
            expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();
        });

        expect(nextBtn).toBeDisabled();

        // Go back to page 2
        mockGetThreads.mockResolvedValueOnce({ content: [], totalPages: 3 });
        await userEvent.click(prevBtn);

        await waitFor(() => {
            expect(mockGetThreads).toHaveBeenCalledWith(1);
        });
    });

    it('ignores fetch error gracefully', async () => {
        mockGetThreads.mockRejectedValueOnce(new Error('Network error'));
        render(<ForumPage />);
        
        await waitFor(() => {
            expect(screen.queryByText('Network error')).not.toBeInTheDocument();
            expect(screen.getByText('No discussions yet')).toBeInTheDocument();
        });
    });
});
