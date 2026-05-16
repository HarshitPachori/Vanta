import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				port: '',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;

if (process.env.NODE_ENV === 'development') {
	initOpenNextCloudflareForDev({
		environment: 'dev',
	});
}
