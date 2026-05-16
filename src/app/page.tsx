export const dynamic = 'force-dynamic';
import FeaturesSection from '@/components/landing/features.section';
import Footer from '@/components/landing/footer';
import HeroSection from '@/components/landing/hero-section';
import HowItWorks from '@/components/landing/how-it-works';
import PricingSection from '@/components/landing/pricing-section';
import SocialProof from '@/components/landing/social-proof';
import Nav from '@/components/nav';
import { getAuthStatus } from '@/lib/auth';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
	title: 'InboxRift — Your inbox, finally quiet.',
	alternates: { canonical: '/' },
};

export default async function HomePage() {
	const { loggedIn, onboarded } = await getAuthStatus();
	if (loggedIn) redirect(onboarded ? '/dashboard' : '/onboarding');
	return (
		<>
			<Link
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-(--color-accent) focus:text-white focus:text-sm focus:font-medium"
			>
				Skip to main content
			</Link>
			<Nav />
			<main id="main-content">
				<HeroSection />
				<SocialProof />
				<Suspense>
					<FeaturesSection />
					<HowItWorks />
					<PricingSection />
				</Suspense>
			</main>
			<Footer />
		</>
	);
}
