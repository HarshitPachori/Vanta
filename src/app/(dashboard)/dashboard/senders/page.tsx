export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDb } from '@backend/lib/db';
import { senders, unsubscribeJobs } from '@backend/db/schema';
import { eq, desc, and, gt } from 'drizzle-orm';
import { now } from '@backend/lib/id';
import { getUser, requireOnboarding } from '@/lib/auth';
import type { Metadata } from 'next';
import SendersClient from '@/components/dashboard/senders-client';

export const metadata: Metadata = { title: 'Senders — Vanta' };

const getData = async () => {
	try {
		const user = await getUser();
		if (!user) return null;

		const { env } = getCloudflareContext();
		const db = getDb(env.DB);

		const [senderRows, jobRows] = await Promise.all([
			db.select().from(senders).where(eq(senders.userId, user.id)).orderBy(desc(senders.emailCount)).all(),
			db
				.select({ id: unsubscribeJobs.id, senderId: unsubscribeJobs.senderId, status: unsubscribeJobs.status })
				.from(unsubscribeJobs)
				.where(and(eq(unsubscribeJobs.userId, user.id), gt(unsubscribeJobs.createdAt, now() - 600)))
				.all(),
		]);

		return { senders: senderRows, jobs: jobRows };
	} catch {
		return null;
	}
};

export default async function SendersPage() {
	await requireOnboarding();
	const data = await getData();
	if (data === null) redirect('/login');

	return (
		<div className="px-5 sm:px-8 py-8 max-w-4xl mx-auto">
			<header className="mb-8">
				<h1 className="font-display font-bold text-2xl text-(--color-text-primary) tracking-tight">Senders</h1>
				<p className="text-sm text-(--color-text-muted) mt-1">All senders detected in your inbox. Select and unsubscribe in bulk.</p>
			</header>
			<SendersClient initialSenders={data.senders} initialJobs={data.jobs} />
		</div>
	);
}
