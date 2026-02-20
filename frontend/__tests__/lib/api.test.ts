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
    clear: jest.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }),
    length: 0,
    key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
});

describe('API client', () => {
    describe('request helper', () => {
        it('adds Content-Type header', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ content: [] }),
            });

            await api.getArticles();

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [, options] = mockFetch.mock.calls[0];
            expect(options.headers['Content-Type']).toBe('application/json');
        });

        it('adds Bearer token from localStorage', async () => {
            mockStorage['token'] = 'my_jwt_token';
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ content: [] }),
            });

            await api.getArticles();

            const [, options] = mockFetch.mock.calls[0];
            expect(options.headers['Authorization']).toBe('Bearer my_jwt_token');
        });

        it('does not add Authorization when no token', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ content: [] }),
            });

            await api.getArticles();

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

        it('throws with fallback when error body not parseable', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () => Promise.reject(new Error('bad json')),
            });

            await expect(api.login({ username: 'x', password: 'y' })).rejects.toThrow('Request failed');
        });
    });

    describe('API methods', () => {
        it('getArticles calls correct endpoint', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ content: [], totalPages: 0 }),
            });

            await api.getArticles(0, 10, 'kotlin');

            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('/articles?page=0&size=10&category=kotlin');
        });

        it('getNews calls correct endpoint', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ content: [] }),
            });

            await api.getNews(1, 5);

            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('/news?page=1&size=5');
        });

        it('login POSTs credentials', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ token: 'jwt', user: {} }),
            });

            await api.login({ username: 'user', password: 'pass' });

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/auth/login');
            expect(options.method).toBe('POST');
            expect(JSON.parse(options.body)).toEqual({ username: 'user', password: 'pass' });
        });

        it('register POSTs registration data', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ token: 'jwt', user: {} }),
            });

            await api.register({ username: 'new', email: 'e@t.com', password: 'p' });

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/auth/register');
            expect(options.method).toBe('POST');
        });

        it('getArticles without category omits category param', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ content: [] }),
            });

            await api.getArticles(0, 10);

            const [url] = mockFetch.mock.calls[0];
            expect(url).not.toContain('category=');
        });
    });
});
