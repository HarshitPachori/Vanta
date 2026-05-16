import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://vanta.app';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/dashboard/', '/api/', '/settings/'],
			},
		],
		sitemap: `${BASE_URL}/sitemap.xml`,
		host: BASE_URL,
	};
}
