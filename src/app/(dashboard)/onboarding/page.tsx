export const dynamic = 'force-dynamic';

import OnboardingClient from '@/components/dashboard/onboarding-client';
import { sessions, users } from '@backend/db/schema';
import { getDb } from '@backend/lib/db';
import { verifyToken } from '@backend/lib/jwt';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { and, eq, gt } from 'drizzle-orm';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Get started — InboxRift' };

const getUser = async () => {
	try {
		const { env } = getCloudflareContext();
		const cookieStore = await cookies();
		const token = cookieStore.get('session')?.value;
		if (!token) return null;

		const payload = await verifyToken<{ sessionId: string }>(token, env.AUTH_JWT_SECRET);
		if (!payload?.sessionId) return null;

		const db = getDb(env.DB);
		const now = Math.floor(Date.now() / 1000);

		const session = await db
			.select()
			.from(sessions)
			.where(and(eq(sessions.id, payload.sessionId), gt(sessions.expiresAt, now)))
			.get();

		if (!session) return null;

		return db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				hasGmailAccess: users.hasGmailAccess,
				scanStatus: users.scanStatus,
				onboardingCompleteAt: users.onboardingCompleteAt,
			})
			.from(users)
			.where(eq(users.id, session.userId))
			.get();
	} catch {
		return null;
	}
};

export default async function OnboardingPage() {
	const user = await getUser();
	if (!user) redirect('/login');

	// already onboarded
	if (user.hasGmailAccess && user.scanStatus === 'done' && user.onboardingCompleteAt !== null) {
		redirect('/dashboard');
	}

	return (
		<div className="min-h-dvh bg-(--color-base) flex flex-col items-center justify-center px-5 py-16">
			<OnboardingClient userName={user.name} hasGmailAccess={user.hasGmailAccess} scanStatus={user.scanStatus} />
		</div>
	);
}
