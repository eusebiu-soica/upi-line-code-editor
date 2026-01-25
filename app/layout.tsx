import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { FileProvider } from "@/contexts/FileContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { SettingsApplier } from "@/components/SettingsApplier";
import { ColorSchemeApplier } from "@/components/ColorSchemeApplier";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Upi Line | Code Editor",
  description: "A powerful code editor with live preview for HTML, CSS, and JavaScript",
  manifest: "/manifest.json",
  // Performance optimizations
  other: {
    "dns-prefetch": "https://cdn.tailwindcss.com https://code.jquery.com",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Upi Line",
  },
  icons: {
    icon: [
      { url: "/icons/icon-36x36.png", sizes: "36x36", type: "image/png" },
      { url: "/icons/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Resource hints for external CDNs - added via script for Next.js app directory */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const hints = [
                  { rel: 'dns-prefetch', href: 'https://cdn.tailwindcss.com' },
                  { rel: 'dns-prefetch', href: 'https://code.jquery.com' },
                  { rel: 'preconnect', href: 'https://cdn.tailwindcss.com', crossorigin: 'anonymous' },
                  { rel: 'preconnect', href: 'https://code.jquery.com', crossorigin: 'anonymous' }
                ];
                hints.forEach(hint => {
                  const link = document.createElement('link');
                  link.rel = hint.rel;
                  link.href = hint.href;
                  if (hint.crossorigin) link.crossOrigin = hint.crossorigin;
                  document.head.appendChild(link);
                });
              })();
            `,
          }}
        />
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <FileProvider>
              <SettingsApplier />
              <ColorSchemeApplier />
              <Header />
              {children}
              <Toaster position="bottom-right" />
              <Analytics />
            </FileProvider>
          </SettingsProvider>
        </ThemeProvider>
        {/* Defer service worker registration to not block initial load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                // Defer service worker registration until after page load and idle
                const registerSW = () => {
                  requestIdleCallback(() => {
                    navigator.serviceWorker.register('/sw.js')
                      .then((registration) => {
                        console.log('SW registered: ', registration);
                      })
                      .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                      });
                  }, { timeout: 2000 });
                };
                
                if (document.readyState === 'complete') {
                  registerSW();
                } else {
                  window.addEventListener('load', registerSW, { once: true });
                }
              }
            `,
          }}
        />
    </body>
    </html >
  );
}
