'use client';

import { cn, glassAvatar, navItem, navItemActive } from '@/lib/cn';
import { EASE_SMOOTH } from '@/lib/motion';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Layers, LayoutDashboard, LogOut, Mail, Menu, ScrollText, Settings, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type User = {
	id: string;
	email: string | null;
	name: string | null;
	avatarUrl: string | null;
	hasGmailAccess: boolean | null;
	scanStatus: string | null;
	lastScannedAt: number | null;
	plan: string;
};

const NAV = [
	{ label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
	{ label: 'Senders', href: '/dashboard/senders', icon: Mail },
	{ label: 'Digest', href: '/dashboard/digest', icon: Layers },
	{ label: 'Activity', href: '/dashboard/logs', icon: ScrollText },
	{ label: 'Settings', href: '/dashboard/settings', icon: Settings },
] as const;

const initials = (name: string | null, email: string | null) =>
	name
		? name
				.split(' ')
				.map((n) => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2)
		: (email?.[0] ?? '?').toUpperCase();

export default function DashboardShell({ user, children }: { user: User; children: React.ReactNode }) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const pathname = usePathname();

	const NavLinks = () => (
		<nav aria-label="Dashboard navigation" className="flex flex-col gap-0.5 flex-1">
			{NAV.map(({ label, href, icon: Icon }) => {
				const active = pathname === href;
				return (
					<Link
						key={href}
						href={href}
						onClick={() => setMobileOpen(false)}
						aria-current={active ? 'page' : undefined}
						className={active ? navItemActive : navItem}
					>
						<Icon size={16} aria-hidden="true" />
						{label}
					</Link>
				);
			})}
		</nav>
	);

	const UserBlock = () => (
		<div className="border-t border-(--color-border) pt-4 mt-4">
			<div className="flex items-center gap-3 px-3 py-2 mb-1">
				{user.avatarUrl ? (
					<Image src={user.avatarUrl} alt="" aria-hidden="true" className={cn(glassAvatar, 'h-8 w-8 rounded-full object-cover shrink-0')} />
				) : (
					<span
						aria-hidden="true"
						className={cn(
							glassAvatar,
							'h-8 w-8 rounded-full bg-(--color-accent-muted) border border-(--color-accent-border) flex items-center justify-center text-xs font-bold font-display text-(--color-accent) shrink-0',
						)}
					>
						{initials(user.name, user.email)}
					</span>
				)}
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium text-(--color-text-primary) truncate leading-tight">{user.name ?? user.email}</p>
					<div className="flex items-center gap-1.5 mt-0.5">
						{user.plan === 'pro' ? (
							<span className="flex items-center gap-1 text-xs text-(--color-accent) font-mono">
								<Crown size={10} aria-hidden="true" />
								Pro
							</span>
						) : (
							<span className="text-xs text-(--color-text-muted) font-mono">Free</span>
						)}
					</div>
				</div>
			</div>

			<form action="/api/auth/logout" method="POST">
				<button
					type="submit"
					className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-(--color-text-muted) hover:text-(--color-danger) hover:bg-(--color-danger-muted) transition-all duration-150"
				>
					<LogOut size={16} aria-hidden="true" />
					Log out
				</button>
			</form>
		</div>
	);

	return (
		<div className="min-h-dvh bg-(--color-base) flex">
			{/* Desktop sidebar */}
			<aside
				aria-label="Sidebar"
				className="hidden lg:flex flex-col w-56 shrink-0 border-r border-(--color-border) bg-(--color-surface) px-4 py-6 sticky top-0 h-dvh"
			>
				{/* Logo */}
				<Link href="/dashboard" className="flex items-center gap-2.5 group mb-8 px-3">
					<span
						aria-hidden="true"
						className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-accent-muted) border border-accent-border text-white text-sm font-bold font-display transition-all duration-200 group-hover:scale-110 group-hover:rotate-3"
					>
						<Image src="/icon.svg" alt="InboxRift logo" width={16} height={16} />
					</span>
					<span className="font-display font-bold text-lg tracking-tight text-(--color-text-primary)">InboxRift</span>
				</Link>

				<NavLinks />
				<UserBlock />
			</aside>

			{/* Mobile header */}
			<div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-5 h-14 bg-(--color-surface)/90 backdrop-blur-xl border-b border-(--color-border)">
				<Link href="/dashboard" className="flex items-center gap-2 group">
					<span
						aria-hidden="true"
						className={cn(
							glassAvatar,
							'flex h-7 w-7 items-center justify-center rounded-lg bg-(--color-accent) text-white text-xs font-bold font-display',
						)}
					>
						V
					</span>
					<span className="font-display font-bold tracking-tight text-(--color-text-primary)">InboxRift</span>
				</Link>
				<button
					type="button"
					aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={mobileOpen}
					onClick={() => setMobileOpen((v) => !v)}
					className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-surface-2) transition-colors"
				>
					<AnimatePresence mode="wait" initial={false}>
						<motion.span
							key={mobileOpen ? 'close' : 'open'}
							initial={{ opacity: 0, rotate: -90 }}
							animate={{ opacity: 1, rotate: 0 }}
							exit={{ opacity: 0, rotate: 90 }}
							transition={{ duration: 0.15 }}
						>
							{mobileOpen ? <X size={16} /> : <Menu size={16} />}
						</motion.span>
					</AnimatePresence>
				</button>
			</div>

			{/* Mobile drawer */}
			<AnimatePresence>
				{mobileOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
							onClick={() => setMobileOpen(false)}
							aria-hidden="true"
						/>
						<motion.aside
							initial={{ x: '-100%' }}
							animate={{ x: 0 }}
							exit={{ x: '-100%' }}
							transition={{ duration: 0.25, ease: EASE_SMOOTH }}
							aria-label="Mobile navigation"
							className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-(--color-surface) border-r border-(--color-border) px-4 py-6 flex flex-col"
						>
							<Link href="/dashboard" className="flex items-center gap-2.5 group mb-8 px-3">
								<span
									aria-hidden="true"
									className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-accent) text-white text-sm font-bold font-display"
								>
									V
								</span>
								<span className="font-display font-bold text-lg tracking-tight text-(--color-text-primary)">InboxRift</span>
							</Link>
							<NavLinks />
							<UserBlock />
						</motion.aside>
					</>
				)}
			</AnimatePresence>

			{/* Main content */}
			<main id="main-content" className="flex-1 min-w-0 lg:ml-0 pt-14 lg:pt-0">
				{children}
			</main>
		</div>
	);
}
