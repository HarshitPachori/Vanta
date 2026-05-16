import { bricolage, dmSans, geistMono } from '@/lib/fonts';
import type { Metadata, Viewport } from 'next';
// @ts-ignore: side-effect import of CSS without type declarations
import './globals.css';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inboxrift.app';

export const metadata: Metadata = {
	metadataBase: new URL(BASE_URL),
	title: {
		default: 'InboxRift — Your inbox, finally quiet.',
		template: '%s | InboxRift',
	},
	description:
		'InboxRift scans your Gmail, kills newsletters you never read, and rebuilds your favourite ones into one clean daily digest.',
	applicationName: 'InboxRift',
	authors: [{ name: 'InboxRift' }],
	keywords: ['inbox cleaner', 'email unsubscribe', 'newsletter digest', 'gmail cleaner', 'inbox zero', 'email management', 'vanta'],
	creator: 'InboxRift',
	publisher: 'InboxRift',
	verification: {
		google: '03ZQtVOwJ2NDIpFO04v4exgY0F6F7YfVMHJpgySUr9s',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: BASE_URL,
		siteName: 'InboxRift',
		title: 'InboxRift — Your inbox, finally quiet.',
		description: 'Scan your Gmail, kill the noise, get one clean daily digest of the emails that actually matter.',
		images: [
			{
				url: '/og',
				width: 1200,
				height: 630,
				alt: 'InboxRift — inbox cleaner and digest rebuilder',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'InboxRift — Your inbox, finally quiet.',
		description: 'Scan your Gmail, kill the noise, get one clean daily digest.',
		images: ['/og'],
		creator: '@vantaapp',
	},
	icons: {
		icon: [
			{ url: '/favicon.ico', sizes: 'any' },
			{ url: '/icon.svg', type: 'image/svg+xml' },
		],
		apple: '/apple-touch-icon.png',
		shortcut: '/favicon-32x32.png',
	},
	manifest: '/site.webmanifest',
	alternates: {
		canonical: BASE_URL,
	},
	category: 'productivity',
};

export const viewport: Viewport = {
	themeColor: '#0F0F12',
	colorScheme: 'dark',
	width: 'device-width',
	initialScale: 1,
	maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${bricolage.variable} ${dmSans.variable} ${geistMono.variable}`}>
			<body className="antialiased min-h-dvh bg-(--color-base) text-(--color-text-primary) font-sans">{children}</body>
		</html>
	);
}
