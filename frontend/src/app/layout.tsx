import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAdSense from "@/components/GoogleAdSense";
import GoogleTagManager, { GoogleTagManagerNoScript } from "@/components/GoogleTagManager";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TheKotlin.com — Professional Kotlin Knowledge Base",
  description:
    "The definitive knowledge database for professional Kotlin developers and architects. Articles, tutorials, forum discussions, and curated resources on Kotlin, coroutines, Multiplatform, Spring Boot, and more.",
  keywords: ["Kotlin", "programming", "coroutines", "Android", "Spring Boot", "Multiplatform", "architecture"],
  openGraph: {
    title: "TheKotlin.com — Professional Kotlin Knowledge Base",
    description: "Deep-dive articles, community forum, and expert resources for Kotlin developers.",
    type: "website",
    url: "https://thekotlin.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
