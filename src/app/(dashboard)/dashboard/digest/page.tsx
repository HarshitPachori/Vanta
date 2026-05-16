export const dynamic = 'force-dynamic';

import DigestClient from '@/components/dashboard/digest-client';
import { getUser, requireOnboarding } from '@/lib/auth';
import { cardSection, cn } from '@/lib/cn';
import { digests, digestSenders, senders } from '@backend/db/schema';
import { getDb } from '@backend/lib/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Digest — InboxRift' };

const getData = async () => {
	try {
		const user = await getUser();
		if (!user) return null;

		const { env } = getCloudflareContext();
		const db = getDb(env.DB);

		const [allSenders, digest] = await Promise.all([
			db.select().from(senders).where(eq(senders.userId, user.id)).orderBy(desc(senders.emailCount)).all(),
			db.select().from(digests).where(eq(digests.userId, user.id)).get(),
		]);

		const digestSenderIds = digest
			? (await db.select({ senderId: digestSenders.senderId }).from(digestSenders).where(eq(digestSenders.digestId, digest.id)).all()).map(
					(r) => r.senderId,
				)
			: [];

		return { user, allSenders, digest: digest ?? null, digestSenderIds };
	} catch {
		return null;
	}
};

export default async function DigestPage() {
	await requireOnboarding();
	const data = await getData();
	if (!data) redirect('/login');

	return (
		<div className="px-5 sm:px-8 py-8 max-w-4xl mx-auto">
			<header className="mb-8">
				<h1 className="font-display font-bold text-2xl text-(--color-text-primary) tracking-tight">Digest</h1>
				<p className="text-sm text-(--color-text-muted) mt-1">Pick senders and get one clean daily email instead of dozens.</p>
			</header>

			{data.user.scanStatus !== 'done' && (
				<div className={cn(cardSection, ' rounded-xl p-6 text-center')}>
					<p className="text-sm text-(--color-text-muted)">Scan your inbox first to see available senders.</p>
				</div>
			)}

			{data.user.scanStatus === 'done' && (
				<DigestClient allSenders={data.allSenders} initialDigest={data.digest} initialSenderIds={data.digestSenderIds} />
			)}
		</div>
	);
}
