import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

interface CapsuleLayoutProps {
  children: React.ReactNode;
  params: { token: string };
}

export async function generateMetadata({ params }: CapsuleLayoutProps): Promise<Metadata> {
  try {
    const capsule = await prisma.memoryCapsule.findUnique({
      where: { capsuleToken: params.token },
      include: {
        event: {
          select: {
            title: true,
            purposeStatement: true,
            date: true,
          },
        },
      },
    });

    const eventTitle = capsule?.event?.title || 'GatherCraft Gathering';
    const title = `Memory Capsule: ${eventTitle} | GatherCraft`;
    const heroQuote = capsule?.heroQuote || capsule?.event?.purposeStatement || 'A night of genuine connection and shared presence.';
    const date = capsule?.event?.date || 'Past Gathering';
    const ogImageUrl = `/api/og?title=${encodeURIComponent(`Memory Capsule: ${eventTitle}`)}&purpose=${encodeURIComponent(heroQuote)}&date=${encodeURIComponent(date)}`;

    return {
      title,
      description: heroQuote,
      openGraph: {
        title,
        description: heroQuote,
        type: 'website',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: heroQuote,
        images: [ogImageUrl],
      },
    };
  } catch {
    return {
      title: 'Memory Capsule | GatherCraft',
      description: 'Relive memories and remix blueprints from an intentional gathering on GatherCraft.',
    };
  }
}

export default function CapsuleLayout({ children }: CapsuleLayoutProps) {
  return <>{children}</>;
}
