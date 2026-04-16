import { query } from '@/app/api/shared/libs/database';

import { MetadataRoute } from 'next';

interface ApartSitemapRow {
  id: number;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/transactions`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/transaction-compare`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    const rows = await query<ApartSitemapRow[]>(
      `SELECT id FROM apartments ORDER BY id`
    );

    const apartPages: MetadataRoute.Sitemap = rows.map(row => ({
      url: `${baseUrl}/apart/${row.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...apartPages];
  } catch {
    return staticPages;
  }
}
