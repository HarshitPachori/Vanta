import ForgotPasswordForm from '@/components/auth/forgot-password-form';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Forgot password',
	description: 'Reset your InboxRift password.',
};

export default function ForgotPasswordPage() {
	return (
		<article className="w-full max-w-sm">
			<header className="text-center mb-8">
				<h1 className="text-2xl font-display font-bold text-(--color-text-primary) tracking-tight">Forgot your password?</h1>
				<p className="mt-2 text-sm text-(--color-text-secondary)">Enter your email and we'll send a reset link.</p>
			</header>

			<ForgotPasswordForm />

			<footer className="mt-6 text-center">
				<p className="text-sm text-(--color-text-muted)">
					Remember it?{' '}
					<Link
						href="/login"
						className="text-(--color-accent) hover:text-(--color-accent-hover) transition-colors duration-150 font-medium"
					>
						Back to log in
					</Link>
				</p>
			</footer>
		</article>
	);
}
