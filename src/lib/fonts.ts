import { Bricolage_Grotesque, DM_Sans, Geist_Mono } from 'next/font/google';

export const bricolage = Bricolage_Grotesque({
	subsets: ['latin'],
	variable: '--font-display',
	display: 'swap',
	weight: ['400', '500', '600', '700', '800'],
});

export const dmSans = DM_Sans({
	subsets: ['latin'],
	variable: '--font-sans',
	display: 'swap',
	weight: ['400', '500', '600'],
});

export const geistMono = Geist_Mono({
	subsets: ['latin'],
	variable: '--font-mono',
	display: 'swap',
});
