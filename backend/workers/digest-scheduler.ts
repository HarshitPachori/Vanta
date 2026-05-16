import { eq, and, lte } from 'drizzle-orm';
import { digests } from '@backend/db/schema';
import { getDb } from '@backend/lib/db';
import { now } from '@backend/lib/id';

export const runDigestScheduler = async (env: CloudflareEnv): Promise<void> => {
	const db = getDb(env.DB);
	const nowSec = now();
	const allActive = await db.select().from(digests).where(eq(digests.status, 'active')).all();

	for (const digest of allActive) {
		if (!isDue(digest.deliveryTime, digest.timezone, digest.lastSentAt, digest.frequency)) {
			continue;
		}
		await env.DIGEST_QUEUE.send({ type: 'digest', digestId: digest.id });
	}
};

const isDue = (deliveryTime: string, timezone: string, lastSentAt: number | null, frequency: string): boolean => {
	try {
		const now = new Date();
		const nowTz = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		}).format(now);

		const [targetH, targetM] = deliveryTime.split(':').map(Number);
		const [currentH, currentM] = nowTz.split(':').map(Number);

		// within a 15-minute window of delivery time
		const targetMins = targetH * 60 + targetM;
		const currentMins = currentH * 60 + currentM;
		const inWindow = Math.abs(currentMins - targetMins) <= 15;

		if (!inWindow) return false;

		// check frequency
		const dayOfWeek = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			weekday: 'long',
		}).format(now);

		if (frequency === 'weekdays' && ['Saturday', 'Sunday'].includes(dayOfWeek)) {
			return false;
		}
		if (frequency === 'weekly' && dayOfWeek !== 'Monday') {
			return false;
		}

		// not already sent today
		if (lastSentAt) {
			const lastSentDate = new Intl.DateTimeFormat('en-US', {
				timeZone: timezone,
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			}).format(new Date(lastSentAt * 1000));

			const todayDate = new Intl.DateTimeFormat('en-US', {
				timeZone: timezone,
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			}).format(now);

			if (lastSentDate === todayDate) return false;
		}

		return true;
	} catch {
		return false;
	}
};
