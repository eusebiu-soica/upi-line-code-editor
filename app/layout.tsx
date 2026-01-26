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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://upi-line-code-editor.vercel.app"),
  title: {
    default: "Upi Line Code Editor - Free Online HTML, CSS, JavaScript Editor with Live Preview",
    template: "%s | Upi Line Code Editor"
  },
  description: "Free online code editor with live preview for HTML, CSS, and JavaScript. Built with Monaco Editor, includes Tailwind CSS, jQuery support, file management, and responsive device preview. Perfect for web development, prototyping, and learning.",
  keywords: [
    "code editor",
    "online code editor",
    "HTML editor",
    "CSS editor",
    "JavaScript editor",
    "live preview",
    "web development",
    "code playground",
    "Monaco editor",
    "Tailwind CSS",
    "jQuery",
    "free code editor",
    "browser code editor",
    "web IDE",
    "frontend development",
    "code sandbox",
    "HTML CSS JS editor",
    "responsive preview",
    "device preview",
    "code comparison",
    "file manager",
    "ZIP extractor",
    "PWA code editor"
  ],
  authors: [{ name: "Upi Line" }],
  creator: "Upi Line",
  publisher: "Upi Line",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Upi Line Code Editor",
    title: "Upi Line Code Editor - Free Online HTML, CSS, JavaScript Editor",
    description: "Free online code editor with live preview for HTML, CSS, and JavaScript. Built with Monaco Editor, includes Tailwind CSS, jQuery support, and responsive device preview.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Upi Line Code Editor - Free Online Code Editor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Upi Line Code Editor - Free Online HTML, CSS, JavaScript Editor",
    description: "Free online code editor with live preview for HTML, CSS, and JavaScript. Built with Monaco Editor, includes Tailwind CSS, jQuery support, and responsive device preview.",
    images: ["/logo.png"],
    creator: "@upiline",
  },
  alternates: {
    canonical: "/",
  },
  category: "development",
  classification: "Web Development Tool",
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
    { media: "(prefers-color-scheme: dark)", color: "#131318" },
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || "https://upi-line-code-editor.vercel.app"} />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
      </head>
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
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Upi Line Code Editor",
              "description": "Free online code editor with live preview for HTML, CSS, and JavaScript. Built with Monaco Editor, includes Tailwind CSS, jQuery support, file management, and responsive device preview.",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://upi-line-code-editor.vercel.app",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "ratingCount": "1"
              },
              "featureList": [
                "Live Preview",
                "Monaco Editor (VS Code editor)",
                "Tailwind CSS Support",
                "jQuery Support",
                "File Management",
                "ZIP Archive Support",
                "Responsive Device Preview",
                "Console Panel",
                "Code Comparison",
                "Theme Support",
                "PWA Support"
              ],
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "softwareVersion": "0.1.0",
              "releaseNotes": "A powerful, modern code editor with live preview for HTML, CSS, and JavaScript",
              "screenshot": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png` : "https://upi-line-code-editor.vercel.app/logo.png",
              "softwareHelp": {
                "@type": "CreativeWork",
                "text": "Free online code editor for HTML, CSS, and JavaScript with live preview, Tailwind CSS support, and responsive device testing."
              }
            })
          }}
        />
        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Upi Line",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://upi-line-code-editor.vercel.app",
              "logo": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png` : "https://upi-line-code-editor.vercel.app/logo.png",
              "sameAs": []
            })
          }}
        />
        {/* SoftwareApplication Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Upi Line Code Editor",
              "applicationCategory": "WebApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "Free online code editor with live preview for HTML, CSS, and JavaScript. Built with Monaco Editor, includes Tailwind CSS, jQuery support, file management, and responsive device preview.",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://upi-line-code-editor.vercel.app",
              "screenshot": process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png` : "https://upi-line-code-editor.vercel.app/logo.png"
            })
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
