import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Methodist Church Ghana",
    template: "%s | Methodist Church Ghana",
  },
  description:
    "A Methodist Church Ghana society website and church management portal.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full antialiased`}
      style={{ fontFamily: "'Creato Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Runs before first paint, ahead of React hydration, so a hard
            refresh/direct link into /admin never flashes the wrong theme.
            admin/layout.tsx's toggle re-applies this on client-side
            navigation (the case this script can't cover, since it only
            runs once per full document load). Public routes are untouched:
            the pathname check makes this a no-op everywhere else, leaving
            them on the prefers-color-scheme behavior in globals.css. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.location.pathname.indexOf('/admin')===0){var t=localStorage.getItem('admin-theme')==='dark'?'dark':'light';document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

