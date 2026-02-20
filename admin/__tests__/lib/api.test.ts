import { api } from '@/lib/api';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockStorage: Record<string, string> = {};
const localStorageMock = {
    getItem: jest.fn((key: string) => mockStorage[key] || null),
    setItem: jest.fn((key: string, value: string) => { mockStorage[key] = value; }),
    removeItem: jest.fn((key: string) => { delete mockStorage[key]; }),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
});

describe('Admin API client', () => {
    describe('request helper', () => {
        it('adds Content-Type header', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            });

            await api.getCategories();

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [, options] = mockFetch.mock.calls[0];
            expect(options.headers['Content-Type']).toBe('application/json');
        });

        it('adds Bearer token from admin_token', async () => {
            mockStorage['admin_token'] = 'admin_jwt';
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            });

            await api.getCategories();

            const [, options] = mockFetch.mock.calls[0];
            expect(options.headers['Authorization']).toBe('Bearer admin_jwt');
        });

        it('does not add Authorization when no token', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            });

            await api.getCategories();

            const [, options] = mockFetch.mock.calls[0];
            expect(options.headers['Authorization']).toBeUndefined();
        });

        it('throws on non-ok response with error message', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: 'Invalid credentials' }),
            });

            await expect(api.login({ username: 'x', password: 'y' })).rejects.toThrow('Invalid credentials');
        });

        it('throws fallback when error body not parseable', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () => Promise.reject(new Error('bad json')),
            });

            await expect(api.login({ username: 'x', password: 'y' })).rejects.toThrow('Request failed');
        });
    });

    describe('API methods', () => {
        it('login POSTs credentials', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ token: 'jwt', user: {} }),
            });

            await api.login({ username: 'admin', password: 'secret' });

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/auth/login');
            expect(options.method).toBe('POST');
            expect(JSON.parse(options.body)).toEqual({ username: 'admin', password: 'secret' });
        });

        it('getMe calls /users/me', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 1, username: 'admin' }),
            });

            await api.getMe();

            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('/users/me');
        });

        it('getStats calls /stats', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ articleCount: 5 }),
            });

            await api.getStats();

            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('/stats');
        });

        it('getArticles calls correct endpoint with pagination', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ content: [] }),
            });

            await api.getArticles(1, 10);

            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('/articles?page=1&size=10');
        });

        it('getCategories calls /categories', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            });

            await api.getCategories();

            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('/categories');
        });

        it('getTags calls /tags', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            });

            await api.getTags();

            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('/tags');
        });

        it('getThreads calls correct endpoint with pagination', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ content: [] }),
            });

            await api.getThreads(2, 25);

            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('/forum/threads?page=2&size=25');
        });
    });
});
