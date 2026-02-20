const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
}

// ==================== Types ====================
export interface UserResponse {
    id: number;
    username: string;
    email: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    role: string;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    user: UserResponse;
}

export interface CategoryResponse {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
}

export interface TagResponse {
    id: number;
    name: string;
    slug: string;
}

export interface ArticleListResponse {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    author: UserResponse;
    category: CategoryResponse | null;
    tags: TagResponse[];
    viewCount: number;
    createdAt: string;
}

export interface ArticleResponse extends ArticleListResponse {
    content: string;
    updatedAt: string;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface ForumThreadResponse {
    id: number;
    title: string;
    author: UserResponse;
    category: CategoryResponse | null;
    isPinned: boolean;
    isLocked: boolean;
    viewCount: number;
    postCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ForumPostResponse {
    id: number;
    content: string;
    author: UserResponse;
    parentId: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface ForumThreadDetailResponse {
    id: number;
    title: string;
    author: UserResponse;
    category: CategoryResponse | null;
    isPinned: boolean;
    isLocked: boolean;
    viewCount: number;
    posts: ForumPostResponse[];
    createdAt: string;
}

export interface NewsResponse {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    content: string | null;
    tag: string;
    tagColor: string;
    sourceUrl: string | null;
    author: UserResponse | null;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface StatsResponse {
    articleCount: number;
    categoryCount: number;
    threadCount: number;
    userCount: number;
    newsCount: number;
}

// ==================== API Functions ====================
export const api = {
    // Auth
    register: (data: { username: string; email: string; password: string; displayName?: string }) =>
        request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

    login: (data: { username: string; password: string }) =>
        request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

    // User
    getMe: () => request<UserResponse>('/users/me'),

    // Articles
    getArticles: (page = 0, size = 10, category?: string) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (category) params.set('category', category);
        return request<PageResponse<ArticleListResponse>>(`/articles?${params}`);
    },

    getArticle: (slug: string) =>
        request<ArticleResponse>(`/articles/${slug}`),

    searchArticles: (q: string, page = 0) =>
        request<PageResponse<ArticleListResponse>>(`/articles/search?q=${encodeURIComponent(q)}&page=${page}`),

    getPopularArticles: (size = 5) =>
        request<ArticleListResponse[]>(`/articles/popular?size=${size}`),

    // Categories
    getCategories: () => request<CategoryResponse[]>('/categories'),

    // Tags
    getTags: () => request<TagResponse[]>('/tags'),

    // Forum
    getThreads: (page = 0, size = 20, category?: string) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (category) params.set('category', category);
        return request<PageResponse<ForumThreadResponse>>(`/forum/threads?${params}`);
    },

    getThread: (id: number) =>
        request<ForumThreadDetailResponse>(`/forum/threads/${id}`),

    createThread: (data: { title: string; content: string; categoryId?: number }) =>
        request<ForumThreadResponse>('/forum/threads', { method: 'POST', body: JSON.stringify(data) }),

    createPost: (threadId: number, data: { content: string; parentId?: number }) =>
        request<ForumPostResponse>(`/forum/threads/${threadId}/posts`, { method: 'POST', body: JSON.stringify(data) }),

    // News
    getNews: (page = 0, size = 20, tag?: string) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (tag) params.set('tag', tag);
        return request<PageResponse<NewsResponse>>(`/news?${params}`);
    },

    getNewsItem: (slug: string) =>
        request<NewsResponse>(`/news/${slug}`),

    // Stats
    getStats: () => request<StatsResponse>('/stats'),
};
