CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER NOT NULL
);

CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL REFERENCES users(id),
    category_id BIGINT REFERENCES categories(id),
    status VARCHAR(20) NOT NULL,
    view_count INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE article_tags (
    article_id BIGINT NOT NULL REFERENCES articles(id),
    tag_id BIGINT NOT NULL REFERENCES tags(id),
    PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE forum_threads (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    author_id BIGINT NOT NULL REFERENCES users(id),
    category_id BIGINT REFERENCES categories(id),
    is_pinned BOOLEAN NOT NULL,
    is_locked BOOLEAN NOT NULL,
    view_count INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE forum_posts (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL REFERENCES users(id),
    thread_id BIGINT NOT NULL REFERENCES forum_threads(id),
    parent_id BIGINT REFERENCES forum_posts(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE news (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT,
    tag VARCHAR(50) NOT NULL,
    tag_color VARCHAR(7) NOT NULL,
    source_url VARCHAR(500),
    author_id BIGINT REFERENCES users(id),
    is_published BOOLEAN NOT NULL,
    published_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
