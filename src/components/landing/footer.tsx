import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const FOOTER_LINKS = {
	Product: [
		{ label: 'Features', href: '/#features' },
		{ label: 'How it works', href: '/#how-it-works' },
		{ label: 'Pricing', href: '/#pricing' },
	],
	Legal: [
		{ label: 'Privacy policy', href: '/privacy' },
		{ label: 'Terms of service', href: '/terms' },
	],
	Account: [
		{ label: 'Log in', href: '/login' },
		{ label: 'Sign up', href: '/signup' },
	],
} as const;

export default function Footer() {
	return (
		<footer role="contentinfo" className="border-t border-(--color-border)">
			{/* CTA strip */}
			<div className="bg-(--color-surface) border-b border-(--color-border)">
				<div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
					<div>
						<h2 className="font-display font-bold text-xl text-(--color-text-primary) tracking-tight">Ready for a quieter inbox?</h2>
						<p className="text-sm text-(--color-text-muted) mt-1">Free to start. Takes 60 seconds.</p>
					</div>
					<Button size="lg" className="shrink-0 shadow-(--shadow-glow-sm)">
						<Link href="/signup">Connect Gmail — it's free</Link>
					</Button>
				</div>
			</div>

			{/* Links */}
			<div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
				<div className="grid grid-cols-2 md:grid-cols-5 gap-10">
					{/* Brand */}
					<div className="col-span-2">
						<Link href="/" aria-label="InboxRift home" className="flex items-center gap-2.5 group w-fit">
							<span
								aria-hidden="true"
								className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-accent-muted) border border-accent-border text-white text-sm font-bold font-display transition-all duration-200 group-hover:scale-110 group-hover:rotate-3"
							>
								<Image src="/icon.svg" alt="InboxRift logo" width={16} height={16} />
							</span>
							<span className="font-display font-bold text-lg tracking-tight text-(--color-text-primary)">InboxRift</span>
						</Link>
						<p className="mt-4 text-sm text-(--color-text-muted) max-w-xs leading-relaxed">
							Your inbox, finally quiet. Unsubscribe at scale, digest what matters.
						</p>
						<p className="mt-5 text-xs text-(--color-text-muted) font-mono">© {new Date().getFullYear()} InboxRift</p>
					</div>

					{/* Link columns */}
					{Object.entries(FOOTER_LINKS).map(([group, links]) => (
						<nav key={group} aria-label={`${group} links`}>
							<h3 className="text-xs font-mono text-(--color-text-muted) uppercase tracking-widest mb-4">{group}</h3>
							<ul className="flex flex-col gap-2.5">
								{links.map(({ label, href }) => (
									<li key={href}>
										<Link
											href={href}
											className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors duration-150 link-underline"
										>
											{label}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					))}
				</div>
			</div>
		</footer>
	);
}
