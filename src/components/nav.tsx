'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { EASE_SMOOTH } from '@/lib/motion';

const NAV_LINKS = [
	{ label: 'Features', href: '/#features' },
	{ label: 'How it works', href: '/#how-it-works' },
	{ label: 'Pricing', href: '/#pricing' },
] as const;

export default function Nav() {
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<motion.header
			role="banner"
			initial={{ opacity: 0, y: -12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: EASE_SMOOTH }}
			className={cn(
				'fixed top-0 inset-x-0 z-50 transition-all duration-300',
				scrolled ? 'bg-(--color-base)/85 backdrop-blur-xl border-b border-(--color-border)' : 'bg-transparent',
			)}
		>
			<div className="mx-auto max-w-6xl px-5 sm:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link href="/" aria-label="Vanta home" className="flex items-center gap-2.5 group">
						<span
							aria-hidden="true"
							className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-accent) text-white text-sm font-bold font-display transition-all duration-200 group-hover:scale-110 group-hover:rotate-3"
						>
							V
						</span>
						<span className="font-display font-bold text-lg tracking-tight text-(--color-text-primary)">Vanta</span>
					</Link>

					{/* Desktop nav */}
					<nav aria-label="Main navigation" className="hidden md:flex items-center gap-0.5">
						{NAV_LINKS.map(({ label, href }) => (
							<Link
								key={href}
								href={href}
								className="px-4 py-2 rounded-lg text-sm font-medium text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-surface-2) transition-all duration-150"
							>
								{label}
							</Link>
						))}
					</nav>

					{/* Desktop CTA */}
					<div className="hidden md:flex items-center gap-2">
						<Link
							href="/login"
							className="px-4 py-2 rounded-lg text-sm font-medium text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-surface-2) transition-all duration-150"
						>
							Log in
						</Link>
						<Button size="sm" className="font-medium">
							<Link href="/signup">Get started free</Link>
						</Button>
					</div>

					{/* Mobile toggle */}
					<button
						type="button"
						aria-label={open ? 'Close menu' : 'Open menu'}
						aria-expanded={open}
						aria-controls="mobile-menu"
						onClick={() => setOpen((v) => !v)}
						className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-surface-2) transition-colors duration-150"
					>
						<AnimatePresence mode="wait" initial={false}>
							<motion.span
								key={open ? 'close' : 'open'}
								initial={{ opacity: 0, rotate: -90 }}
								animate={{ opacity: 1, rotate: 0 }}
								exit={{ opacity: 0, rotate: 90 }}
								transition={{ duration: 0.15 }}
							>
								{open ? <X size={18} /> : <Menu size={18} />}
							</motion.span>
						</AnimatePresence>
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			<AnimatePresence>
				{open && (
					<motion.div
						id="mobile-menu"
						role="dialog"
						aria-label="Mobile navigation"
						aria-modal="true"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.25, ease: EASE_SMOOTH }}
						className="md:hidden overflow-hidden bg-(--color-base)/95 backdrop-blur-xl border-b border-(--color-border)"
					>
						<nav aria-label="Mobile navigation links" className="mx-auto max-w-6xl px-5 py-4 flex flex-col gap-1">
							{NAV_LINKS.map(({ label, href }, i) => (
								<motion.div
									key={href}
									initial={{ opacity: 0, x: -8 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: i * 0.05, duration: 0.2 }}
								>
									<Link
										href={href}
										className="block px-4 py-3 rounded-lg text-sm font-medium text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-surface-2) transition-colors duration-150"
									>
										{label}
									</Link>
								</motion.div>
							))}
							<hr className="my-2 border-(--color-border)" />
							<Link
								href="/login"
								className="block px-4 py-3 rounded-lg text-sm font-medium text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-surface-2) transition-colors duration-150"
							>
								Log in
							</Link>
							<Button className="mt-1 w-full">
								<Link href="/signup">Get started free</Link>
							</Button>
						</nav>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.header>
	);
}
