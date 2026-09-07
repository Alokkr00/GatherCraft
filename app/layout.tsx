import './globals.css';
import type { Metadata, Viewport } from 'next';
import Navbar from '@/components/Navbar';

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
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 bg-slate-950/60">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 GatherCraft. Purpose-First Event Architecture.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                System Active
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
