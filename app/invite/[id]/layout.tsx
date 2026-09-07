import type { Metadata } from 'next';
import { getEventByIdServer } from '@/lib/server/store';

interface InviteLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export async function generateMetadata({ params }: InviteLayoutProps): Promise<Metadata> {
  try {
    const event = await getEventByIdServer(params.id);
    const title = event?.title ? `You're Invited: ${event.title} | GatherCraft` : "You're Invited | GatherCraft";
    const purpose = event?.purpose?.isPrivate 
      ? 'Join us for an intentional, purpose-first gathering.' 
      : (event?.purpose?.selectedStatement || 'Join us for an intentional, purpose-first gathering.');
    const date = event?.date || 'Upcoming Gathering';
    const ogImageUrl = `/api/og?title=${encodeURIComponent(event?.title || 'GatherCraft Gathering')}&purpose=${encodeURIComponent(purpose)}&date=${encodeURIComponent(date)}`;

    return {
      title,
      description: purpose,
      openGraph: {
        title,
        description: purpose,
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
        description: purpose,
        images: [ogImageUrl],
      },
    };
  } catch {
    return {
      title: "You're Invited | GatherCraft",
      description: 'Join us for an intentional, purpose-first gathering. RSVP with 1 click.',
    };
  }
}

export default function InviteLayout({ children }: InviteLayoutProps) {
  return <>{children}</>;
}
