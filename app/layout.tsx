import './globals.css';
import type { Metadata, Viewport } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gathercraft.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GatherCraft — Bring People Together. On Purpose.',
    template: '%s | GatherCraft',
  },
  description: 'The purpose-first operating system for hosting memorable, intentional gatherings. Inspired by Priya Parker\'s The Art of Gathering—with 1-click magic-link RSVPs, live copilot HUD, and viral memory capsules.',
  keywords: [
    'gathering planner',
    'party planner',
    'purpose-first gathering',
    'The Art of Gathering',
    'Priya Parker',
    'magic link RSVP',
    'event host copilot',
    'live mode party HUD',
    'memory capsule',
    'social gathering app',
    'intentional hosting',
    'event run-of-show',
  ],
  authors: [{ name: 'GatherCraft Team', url: siteUrl }],
  creator: 'GatherCraft',
  publisher: 'GatherCraft',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'GatherCraft',
    title: 'GatherCraft — Bring People Together. On Purpose.',
    description: 'Stop planning parties with spreadsheets. GatherCraft helps you design, host, and reflect on meaningful gatherings with purpose at the center.',
    images: [
      {
        url: '/api/og?title=GatherCraft&purpose=Bring+People+Together.+On+Purpose.',
        width: 1200,
        height: 630,
        alt: 'GatherCraft — Purpose-First Event Architecture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GatherCraft — Bring People Together. On Purpose.',
    description: 'The purpose-first operating system for hosting intentional gatherings. 1-click RSVPs, live copilot HUD, and post-event memory capsules.',
    images: ['/api/og?title=GatherCraft&purpose=Bring+People+Together.+On+Purpose.'],
    creator: '@gathercraft',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GatherCraft',
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-[100dvh] flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:font-bold focus:rounded-xl focus:shadow-xl focus:ring-2 focus:ring-white transition-all"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
