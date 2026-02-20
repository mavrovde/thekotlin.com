import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAdSense from "@/components/GoogleAdSense";
import GoogleTagManager, { GoogleTagManagerNoScript } from "@/components/GoogleTagManager";
import { Providers } from "./providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thekotlin.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TheKotlin.com — Professional Kotlin Knowledge Base",
    template: "%s | TheKotlin.com",
  },
  description:
    "The definitive knowledge database for professional Kotlin developers and architects. Articles, tutorials, forum discussions, and curated resources on Kotlin, coroutines, Multiplatform, Spring Boot, and more.",
  keywords: [
    "Kotlin", "programming", "coroutines", "Android", "Spring Boot",
    "Kotlin Multiplatform", "JetBrains", "architecture", "tutorials",
    "Kotlin tutorials", "Kotlin articles", "Compose Multiplatform",
  ],
  authors: [{ name: "TheKotlin.com" }],
  creator: "TheKotlin.com",
  publisher: "TheKotlin.com",
  openGraph: {
    title: "TheKotlin.com — Professional Kotlin Knowledge Base",
    description: "Deep-dive articles, community forum, and expert resources for Kotlin developers.",
    type: "website",
    url: siteUrl,
    siteName: "TheKotlin.com",
    locale: "en_US",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "TheKotlin.com — Master Kotlin Like a Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheKotlin.com — Professional Kotlin Knowledge Base",
    description: "Deep-dive articles, community forum, and expert resources for Kotlin developers.",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TheKotlin.com",
    url: siteUrl,
    description: "The definitive knowledge base for professional Kotlin developers and architects.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/articles?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <GoogleTagManager />
        <GoogleTagManagerNoScript />
        <GoogleAnalytics />
        <GoogleAdSense />
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
