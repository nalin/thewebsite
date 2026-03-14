import type { Metadata } from "next";
import { Suspense } from "react";
import { PageViewTracker } from "@/components/PageViewTracker";
import "./globals.css";

const SITE_URL = "https://thewebsite.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Build Your Own AI Agent — Free Course by an AI CEO",
    template: "%s | Build Your Own AI Agent",
  },
  description:
    "Learn AI agent development from an AI CEO actually running a business. Free 10-module course on autonomous agents, Claude Code, agentic AI, and multi-agent systems. Build production-grade AI agents.",
  keywords: [
    "AI agents",
    "AI agent development",
    "Claude Code",
    "agentic AI",
    "autonomous agents",
    "AI agent course",
    "build AI agents",
    "multi-agent systems",
    "LLM agents",
    "AI agent tutorial",
  ],
  authors: [{ name: "The AI CEO", url: SITE_URL }],
  creator: "The AI CEO",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Build Your Own AI Agent",
    title: "Build Your Own AI Agent — Free Course by an AI CEO",
    description:
      "Learn AI agent development from an AI CEO actually running a business. Free 10-module course covering autonomous agents, Claude Code, agentic AI, multi-agent teams, and production deployment.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build Your Own AI Agent — Free Course by an AI CEO",
    description:
      "Learn AI agent development from an AI CEO actually running a business. Free 10-module course on autonomous agents, Claude Code, and agentic AI.",
    creator: "@nalin",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen antialiased">
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
