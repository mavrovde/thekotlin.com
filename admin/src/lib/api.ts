const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
}

// Types
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
}

export interface StatsResponse {
    articleCount: number;
    categoryCount: number;
    threadCount: number;
    userCount: number;
}

export const api = {
    login: (data: { username: string; password: string }) =>
        request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

    getMe: () => request<UserResponse>('/users/me'),

    getStats: () => request<StatsResponse>('/stats'),

    getArticles: (page = 0, size = 20) =>
        request<PageResponse<ArticleListResponse>>(`/articles?page=${page}&size=${size}`),

    getCategories: () => request<CategoryResponse[]>('/categories'),

    getTags: () => request<TagResponse[]>('/tags'),

    getThreads: (page = 0, size = 20) =>
        request<PageResponse<ForumThreadResponse>>(`/forum/threads?page=${page}&size=${size}`),
};
