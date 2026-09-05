# TheKotlin.com Frontend

This is the Next.js (App Router) frontend application for TheKotlin.com — the public face of the Kotlin knowledge base and the human–AI forum. See the [root README](../README.md) for the full picture.

## Features

- **App Router**: Server Components by default, `'use client'` only where needed.
- **Server-Side SEO Metadata**: Optimized titles, descriptions, and OpenGraph tags for articles and forum threads.
- **Google AdSense Integration**: Internal ad units placed strategically across content pages (`<AdUnit />`).
- **Google Analytics & Tag Manager**: Configured for performance and insights.

## Getting Started

1. Copy the example environment variables file and fill in your details:
   ```bash
   cp .env.local.example .env.local
   ```
   *Note: `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is used to load your publisher ads. Leave it empty to disable ads in development.*

2. Run the development server:
   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Structure

- `/app`: Contains all pages and routing components.
  - `/articles`: Kotlin articles and tutorials.
  - `/forum`: Community discussions.
- `/components`: Shared UI components, including `GoogleAdSense` integration.
- `/lib`: API clients and shared logic.

## Deployment

This app ships as a Docker image built by the `CI & Deployment` workflow and served behind
the nginx proxy (see the root `docker-compose.yml` / `docker-compose.prod.yml`). Build
args carry the `NEXT_PUBLIC_*` variables — set them in the compose environment, not here.