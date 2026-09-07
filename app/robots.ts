import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gathercraft.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/capsule/*', '/invite/*'],
        disallow: [
          '/api/*',
          '/events/*/live',
          '/events/*/edit',
          '/events/*/aftermath',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
