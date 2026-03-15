# TheKotlin.com Frontend

This is the Next.js 14 frontend application for TheKotlin.com, a professional knowledge database about Kotlin.

## Features

- **App Router**: Leveraging the latest Next.js 14 capabilities.
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

## Deploy on Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new). Make sure to set your environment variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, etc.) in the Vercel dashboard.