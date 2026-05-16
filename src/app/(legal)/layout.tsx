import Image from 'next/image';
import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-dvh bg-(--color-base) flex flex-col">
			<header className="px-6 py-4 border-b border-(--color-surface-2)">
				<Link href="/" aria-label="InboxRift home" className="flex items-center gap-2 w-fit group">
					<span
						aria-hidden="true"
						className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-accent-muted) border border-accent-border text-white text-sm font-bold font-display transition-all duration-200 group-hover:scale-110 group-hover:rotate-3"
					>
						<Image src="/icon.svg" alt="InboxRift logo" width={16} height={16} />
					</span>
					<span className="font-display font-bold text-lg tracking-tight text-(--color-text-primary)">InboxRift</span>
				</Link>
			</header>

			<main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">{children}</main>

			<footer className="px-6 py-6 border-t border-(--color-surface-2) text-center">
				<div className="flex items-center justify-center gap-4 text-xs text-(--color-text-muted)">
					<Link href="/privacy" className="hover:text-(--color-text-primary) transition-colors duration-150">
						Privacy Policy
					</Link>
					<span>·</span>
					<Link href="/terms" className="hover:text-(--color-text-primary) transition-colors duration-150">
						Terms of Service
					</Link>
					<span>·</span>
					<Link href="/" className="hover:text-(--color-text-primary) transition-colors duration-150">
						Back to InboxRift
					</Link>
				</div>
			</footer>
		</div>
	);
}
