import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'GatherCraft Event';
    const purpose = searchParams.get('purpose') || 'Join us for a purpose-first gathering';
    const date = searchParams.get('date') || 'Upcoming Event';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#020617',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #1e1b4b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #0f172a 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            padding: '60px',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'linear-gradient(to top right, #4f46e5, #7c3aed, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              🍸
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
                GatherCraft
              </span>
              <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>
                Purpose-First Event Architecture
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 16px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              📅 {date}
            </div>

            <h1
              style={{
                fontSize: '56px',
                fontWeight: '900',
                color: '#ffffff',
                lineHeight: '1.1',
                margin: 0,
                letterSpacing: '-1px',
              }}
            >
              {title}
            </h1>

            <p
              style={{
                fontSize: '22px',
                color: '#cbd5e1',
                lineHeight: '1.4',
                margin: 0,
              }}
            >
              "{purpose}"
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#64748b',
              fontSize: '16px',
            }}
          >
            <span>RSVP Required • Powered by GatherCraft</span>
            <span style={{ color: '#818cf8', fontWeight: '600' }}>gathercraft.app</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('OG Image Generation Error:', e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
