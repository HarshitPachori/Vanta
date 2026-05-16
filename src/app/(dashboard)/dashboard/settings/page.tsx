export const dynamic = 'force-dynamic';

import DeleteAccountButton from '@/components/dashboard/delete-account-button';
import { SessionsList } from '@/components/dashboard/sessions-list';
import { Button } from '@/components/ui/button';
import { getUser } from '@/lib/auth';
import { cardSection, cn, glassAvatar, iconSquare } from '@/lib/cn';
import { sessions, subscriptions } from '@backend/db/schema';
import { getDb } from '@backend/lib/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { and, eq, gt } from 'drizzle-orm';
import { CheckCircle, Crown, Mail, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Settings — InboxRift' };

const getData = async () => {
	try {
		const user = await getUser();
		if (!user) return null;

		const { env } = getCloudflareContext();
		const db = getDb(env.DB);
		const now = Math.floor(Date.now() / 1000);

		const [sub, allSessions] = await Promise.all([
			db.select().from(subscriptions).where(eq(subscriptions.userId, user.id)).get(),
			db
				.select({
					id: sessions.id,
					ipAddress: sessions.ipAddress,
					userAgent: sessions.userAgent,
					country: sessions.country,
					city: sessions.city,
					createdAt: sessions.createdAt,
				})
				.from(sessions)
				.where(and(eq(sessions.userId, user.id), gt(sessions.expiresAt, now)))
				.all(),
		]);

		const activeSessions = allSessions.map((s) => ({
			...s,
			isCurrent: s.id === user.sessionId,
		}));

		return { user, sub, activeSessions };
	} catch {
		return null;
	}
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ gmail?: string }> }) {
	const data = await getData();
	if (!data) redirect('/login');
	const { user, sub, activeSessions } = data;

	const { gmail } = await searchParams;
	const gmailJustConnected = gmail === 'connected';

	return (
		<div className="px-5 sm:px-8 py-8 max-w-2xl mx-auto">
			<header className="mb-8">
				<h1 className="font-display font-bold text-2xl text-(--color-text-primary) tracking-tight">Settings</h1>
				<p className="text-sm text-(--color-text-muted) mt-1">Manage your account and connections.</p>
			</header>

			{gmailJustConnected && (
				<div
					role="status"
					className="flex items-start gap-2.5 mb-6 px-4 py-3 rounded-lg bg-(--color-success-muted) border border-(--color-success)/20 text-sm text-(--color-success)"
				>
					<CheckCircle size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
					<span>Gmail reconnected successfully.</span>
				</div>
			)}

			<div className="flex flex-col gap-4">
				{/* Account */}
				<section aria-labelledby="account-heading" className={cn(cardSection, ' rounded-xl p-6')}>
					<h2 id="account-heading" className="font-display font-bold text-sm text-(--color-text-primary) tracking-tight mb-4">
						Account
					</h2>
					<div className="flex items-center gap-4">
						{user.avatarUrl ? (
							<Image src={user.avatarUrl} alt="" aria-hidden="true" className="h-12 w-12 rounded-full object-cover shrink-0" />
						) : (
							<span
								aria-hidden="true"
								className={cn(
									glassAvatar,
									'h-12 w-12 rounded-full bg-(--color-accent-muted) border border-(--color-accent-border) flex items-center justify-center text-sm font-bold font-display text-(--color-accent)',
								)}
							>
								{(user.name ?? user.email ?? '?')[0].toUpperCase()}
							</span>
						)}
						<div>
							<p className="font-medium text-(--color-text-primary)">{user.name ?? '—'}</p>
							<p className="text-sm text-(--color-text-muted)">{user.email}</p>
							<p className="text-xs text-(--color-text-muted) font-mono mt-1">
								Member since {new Date((user.createdAt ?? 0) * 1000).toLocaleDateString()}
							</p>
						</div>
					</div>
				</section>

				{/* Gmail connection */}
				<section aria-labelledby="gmail-heading" className={cn(cardSection, ' rounded-xl p-6')}>
					<h2 id="gmail-heading" className="font-display font-bold text-sm text-(--color-text-primary) tracking-tight mb-4">
						Gmail connection
					</h2>
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<span
								aria-hidden="true"
								className={cn(
									user.hasGmailAccess
										? iconSquare('bg-(--color-success-muted) border border-(--color-success)/20')
										: iconSquare('bg-(--color-surface-2) border border-(--color-border)'),
								)}
							>
								<Mail size={16} className={user.hasGmailAccess ? 'text-(--color-success)' : 'text-(--color-text-muted)'} />
							</span>
							<div>
								<p className="text-sm font-medium text-(--color-text-primary)">
									{user.hasGmailAccess ? 'Gmail connected' : 'Gmail not connected'}
								</p>
								<p className="text-xs text-(--color-text-muted)">
									{user.hasGmailAccess ? 'Read access granted' : 'Connect to scan your inbox'}
								</p>
							</div>
						</div>
						<Button variant={user.hasGmailAccess ? 'outline' : 'default'} size="sm">
							<Link href="/api/auth/google/gmail">{user.hasGmailAccess ? 'Reconnect' : 'Connect'}</Link>
						</Button>
					</div>
				</section>

				{/* Plan */}
				<section aria-labelledby="plan-heading" className={cn(cardSection, ' rounded-xl p-6')}>
					<h2 id="plan-heading" className="font-display font-bold text-sm text-(--color-text-primary) tracking-tight mb-4">
						Plan
					</h2>
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<span aria-hidden="true" className={iconSquare(' bg-(--color-accent-muted) border border-(--color-accent-border)')}>
								<Crown size={16} className="text-(--color-accent)" />
							</span>
							<div>
								<p className="text-sm font-medium text-(--color-text-primary) capitalize">{sub?.plan ?? 'free'} plan</p>
								<p className="text-xs text-(--color-text-muted)">
									{sub?.plan === 'pro'
										? `Renews ${sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd * 1000).toLocaleDateString() : '—'}`
										: '25 unsubscribes / month'}
								</p>
							</div>
						</div>
						{sub?.plan !== 'pro' && (
							<Button size="sm">
								<Link href="/signup?plan=pro">Upgrade to Pro</Link>
							</Button>
						)}
					</div>
				</section>

				{/* Privacy */}
				<section aria-labelledby="privacy-heading" className={cn(cardSection, ' rounded-xl p-6')}>
					<h2 id="privacy-heading" className="font-display font-bold text-sm text-(--color-text-primary) tracking-tight mb-2">
						Privacy
					</h2>
					<p className="text-xs text-(--color-text-muted) leading-relaxed mb-4">
						InboxRift reads email headers only. No email content is ever stored. Your Gmail tokens are encrypted at rest.
					</p>
					<div className="flex items-center gap-2 text-xs text-(--color-success) font-mono">
						<ShieldCheck size={13} aria-hidden="true" />
						Read-only access · Zero content stored · Revoke anytime in Google Account
					</div>
				</section>

				{/* Active sessions */}
				<section aria-labelledby="sessions-heading" className={cn(cardSection, 'rounded-xl p-6')}>
					<h2 id="sessions-heading" className="font-display font-bold text-sm text-(--color-text-primary) tracking-tight mb-1">
						Active sessions
					</h2>
					<p className="text-xs text-(--color-text-muted) mb-4">Devices currently signed in to your account.</p>
					<SessionsList sessions={activeSessions} />
				</section>

				{/* Danger zone */}
				<section aria-labelledby="danger-heading" className={cn(cardSection, 'rounded-xl p-6 border-(--color-danger)/20')}>
					<h2 id="danger-heading" className="font-display font-bold text-sm text-(--color-danger) tracking-tight mb-2">
						Danger zone
					</h2>
					<p className="text-xs text-(--color-text-muted) leading-relaxed mb-4">
						Permanently delete your account and all associated data. This cannot be undone.
					</p>
					<DeleteAccountButton />
				</section>
			</div>
		</div>
	);
}
