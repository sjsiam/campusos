import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import AppShell from "@/components/BottomNav";
import SessionGate from "@/components/Session";
import { FullScreenSpinner } from "@/components/ui";

// Two voices (system.md v3 §2): Source Sans 3 for text, Barlow Semi Condensed for times, rooms and codes.
// Self-hosted Latin subsets (app/fonts): no network at build/dev time, safe on bad campus Wi-Fi.
const text = localFont({ src: "./fonts/SourceSans3-latin-var.woff2", weight: "200 900", variable: "--font-text", display: "swap" });
const fig = localFont({
  src: [
    { path: "./fonts/BarlowSemiCondensed-latin-500.woff2", weight: "500" },
    { path: "./fonts/BarlowSemiCondensed-latin-600.woff2", weight: "600" },
    { path: "./fonts/BarlowSemiCondensed-latin-700.woff2", weight: "700" },
  ],
  variable: "--font-fig", display: "swap",
});

export const metadata: Metadata = {
  title: "CampusOS",
  description: "Campus schedules, assignments and class updates in one place.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0E5A5B" },
    { media: "(prefers-color-scheme: dark)", color: "#0B2E2E" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${text.variable} ${fig.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Suspense: usePathname suspends on dynamic routes like /assignments/[id] under cacheComponents. */}
        <Suspense fallback={<FullScreenSpinner />}>
          <SessionGate>
            <AppShell>{children}</AppShell>
          </SessionGate>
        </Suspense>
      </body>
    </html>
  );
}
