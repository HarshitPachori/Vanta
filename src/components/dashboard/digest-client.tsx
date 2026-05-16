'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cardSection, cn, metricCard, pillAccent, pillNeutral, tableRow } from '@/lib/cn';
import { fadeUp, stagger } from '@/lib/motion';
import type { Digest, Sender } from '@backend/db/schema';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, Layers, Loader, Pause, Play, Search } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';
import EmptyState from './empty-state';

type Props = {
	allSenders: Sender[];
	initialDigest: Digest | null;
	initialSenderIds: string[];
};

const TIMEZONES = [
	'UTC',
	'America/New_York',
	'America/Chicago',
	'America/Denver',
	'America/Los_Angeles',
	'Europe/London',
	'Europe/Paris',
	'Europe/Berlin',
	'Asia/Kolkata',
	'Asia/Dubai',
	'Asia/Tokyo',
	'Australia/Sydney',
];

const TIMES = Array.from({ length: 24 }, (_, i) => {
	const h = String(i).padStart(2, '0');
	return { value: `${h}:00`, label: `${h}:00` };
});

const CATEGORY_COLORS: Record<string, string> = {
	newsletter: 'bg-(--color-accent-muted) text-(--color-accent) border-(--color-accent-border)',
	promo: 'bg-(--color-warning-muted) text-(--color-warning) border-amber-700/20',
	social: 'bg-(--color-surface-3) text-(--color-text-muted) border-(--color-border)',
	transactional: 'bg-(--color-success-muted) text-(--color-success) border-(--color-success)/20',
	cold: 'bg-(--color-danger-muted) text-(--color-danger) border-(--color-danger)/20',
	other: 'bg-(--color-surface-3) text-(--color-text-muted) border-(--color-border)',
};

export default function DigestClient({ allSenders, initialDigest, initialSenderIds }: Props) {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSenderIds));
	const [name, setName] = useState(initialDigest?.name ?? 'My Digest');
	const [time, setTime] = useState(initialDigest?.deliveryTime ?? '08:00');
	const [timezone, setTimezone] = useState(initialDigest?.timezone ?? 'UTC');
	const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekly'>((initialDigest?.frequency as never) ?? 'daily');
	const [status, setStatus] = useState(initialDigest?.status ?? 'active');
	const [search, setSearch] = useState('');
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	const filtered = useMemo(
		() =>
			allSenders.filter(
				(s) =>
					s.status !== 'unsubscribed' &&
					(s.email.toLowerCase().includes(search.toLowerCase()) || s.displayName?.toLowerCase().includes(search.toLowerCase())),
			),
		[allSenders, search],
	);

	const toggleSender = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	};

	const save = () => {
		setError(null);
		startTransition(async () => {
			try {
				const res = await fetch('/api/digest', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name,
						deliveryTime: time,
						timezone,
						frequency,
						senderIds: Array.from(selectedIds),
					}),
				});
				if (res.ok) {
					setSaved(true);
					setTimeout(() => setSaved(false), 3000);
				} else {
					const body = await res.json<{ error: string }>();
					setError(body.error ?? 'Failed to save.');
				}
			} catch {
				setError('Something went wrong.');
			}
		});
	};

	const togglePause = () => {
		const newStatus = status === 'active' ? 'paused' : 'active';
		startTransition(async () => {
			const res = await fetch('/api/digest/status', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			});
			if (res.ok) setStatus(newStatus);
		});
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Saved banner */}
			<AnimatePresence>
				{saved && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						role="status"
						className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-(--color-success-muted) border border-(--color-success)/20 text-sm text-(--color-success)"
					>
						<CheckCircle size={15} aria-hidden="true" />
						Digest saved successfully.
					</motion.div>
				)}
			</AnimatePresence>

			{error && (
				<p role="alert" className="text-sm text-(--color-danger)">
					{error}
				</p>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left — config */}
				<aside className="lg:col-span-1 flex flex-col gap-4">
					{/* Digest settings card */}
					<section aria-labelledby="digest-config-heading" className={cn(cardSection, ' rounded-xl p-5 flex flex-col gap-4')}>
						<h2
							id="digest-config-heading"
							className="font-display font-bold text-sm text-(--color-text-primary) tracking-tight flex items-center gap-2"
						>
							<Layers size={14} aria-hidden="true" className="text-(--color-accent)" />
							Configuration
						</h2>

						{/* Name */}
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="digest-name" className="text-xs text-(--color-text-muted)">
								Digest name
							</Label>
							<Input id="digest-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Digest" className="text-sm" />
						</div>

						{/* Delivery time */}
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="digest-time" className="text-xs text-(--color-text-muted) flex items-center gap-1.5">
								<Clock size={11} aria-hidden="true" />
								Delivery time
							</Label>
							<select
								id="digest-time"
								value={time}
								onChange={(e) => setTime(e.target.value)}
								className="flex h-10 w-full rounded-lg border border-(--color-border) bg-(--color-surface-2) px-3 text-sm text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
							>
								{TIMES.map((t) => (
									<option key={t.value} value={t.value}>
										{t.label}
									</option>
								))}
							</select>
						</div>

						{/* Timezone */}
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="digest-tz" className="text-xs text-(--color-text-muted)">
								Timezone
							</Label>
							<select
								id="digest-tz"
								value={timezone}
								onChange={(e) => setTimezone(e.target.value)}
								className="flex h-10 w-full rounded-lg border border-(--color-border) bg-(--color-surface-2) px-3 text-sm text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
							>
								{TIMEZONES.map((tz) => (
									<option key={tz} value={tz}>
										{tz}
									</option>
								))}
							</select>
						</div>

						{/* Frequency */}
						<div className="flex flex-col gap-1.5">
							<Label className="text-xs text-(--color-text-muted) flex items-center gap-1.5">
								<Calendar size={11} aria-hidden="true" />
								Frequency
							</Label>
							<div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Frequency">
								{(['daily', 'weekdays', 'weekly'] as const).map((f) => (
									<button
										key={f}
										type="button"
										onClick={() => setFrequency(f)}
										aria-pressed={frequency === f}
										className={cn(
											'px-2 py-2 rounded-lg text-xs font-mono transition-all duration-150 border',
											frequency === f
												? 'bg-(--color-accent-muted) text-(--color-accent) border-(--color-accent-border)'
												: 'text-(--color-text-muted) border-(--color-border) hover:text-(--color-text-primary) hover:bg-(--color-surface-2)',
										)}
									>
										{f}
									</button>
								))}
							</div>
						</div>
					</section>

					{/* Stats */}
					<div className={cn(metricCard, 'rounded-xl p-4 flex items-center justify-between')}>
						<div>
							<p className="text-xs text-(--color-text-muted) font-mono">Selected senders</p>
							<p className="font-display font-black text-2xl text-(--color-accent) leading-none mt-1">{selectedIds.size}</p>
						</div>
						<div className="text-right">
							<p className="text-xs text-(--color-text-muted) font-mono">Status</p>
							<p
								className={cn(
									'text-sm font-mono font-medium mt-1',
									status === 'active' ? 'text-(--color-success)' : 'text-(--color-text-muted)',
								)}
							>
								{status}
							</p>
						</div>
					</div>

					{/* Actions */}
					<div className="flex flex-col gap-2">
						<Button onClick={save} disabled={pending || selectedIds.size === 0} className="w-full shadow-(--shadow-glow-sm)">
							{pending ? <Loader size={14} className="animate-spin" aria-hidden="true" /> : <CheckCircle size={14} aria-hidden="true" />}
							{pending ? 'Saving…' : 'Save digest'}
						</Button>

						{initialDigest && (
							<Button variant="outline" onClick={togglePause} disabled={pending} className="w-full">
								{status === 'active' ? (
									<>
										<Pause size={14} aria-hidden="true" />
										Pause digest
									</>
								) : (
									<>
										<Play size={14} aria-hidden="true" />
										Resume digest
									</>
								)}
							</Button>
						)}
					</div>
				</aside>

				{/* Right — sender picker */}
				<section aria-labelledby="sender-picker-heading" className="lg:col-span-2 flex flex-col gap-3">
					<div className="flex items-center justify-between gap-3">
						<h2 id="sender-picker-heading" className="font-display font-bold text-sm text-(--color-text-primary) tracking-tight">
							Pick senders for your digest
						</h2>
						<span className="text-xs font-mono text-(--color-text-muted)">{selectedIds.size} selected</span>
					</div>

					{/* Search */}
					<div className="relative">
						<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" aria-hidden="true" />
						<Input
							placeholder="Search senders…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9"
							aria-label="Search senders"
						/>
					</div>

					{/* Empty */}
					{filtered.length === 0 && (
						<EmptyState
							icon={Layers}
							title="No senders available"
							description={
								allSenders.length === 0
									? 'Scan your inbox first to see senders you can add to your digest.'
									: 'No senders match your search.'
							}
							className={cn(cardSection)}
						/>
					)}

					{/* List */}
					<motion.ul
						role="list"
						aria-label="Available senders"
						variants={stagger(0.03)}
						initial="hidden"
						animate="show"
						className="flex flex-col gap-1.5 max-h-130 overflow-y-auto pr-1"
					>
						{filtered.map((sender) => {
							const isSelected = selectedIds.has(sender.id);
							return (
								<motion.li key={sender.id} variants={fadeUp(0)}>
									<button
										type="button"
										onClick={() => toggleSender(sender.id)}
										aria-pressed={isSelected}
										className={cn(
											'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 border',
											isSelected
												? 'bg-(--color-accent-muted) border-(--color-accent-border)'
												: 'bg-(--color-surface) border-(--color-border) hover:bg-(--color-surface-2) hover:border-(--color-border)',
										)}
									>
										{/* Avatar */}
										<span
											aria-hidden="true"
											className={cn(
												'h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold font-display shrink-0 transition-all duration-150',
												isSelected ? 'bg-(--color-accent) text-white' : 'bg-(--color-surface-3) text-(--color-text-muted)',
											)}
										>
											{(sender.displayName ?? sender.email)[0].toUpperCase()}
										</span>

										{/* Info */}
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-(--color-text-primary) truncate leading-tight">
												{sender.displayName ?? sender.email}
											</p>
											<p className="text-xs text-(--color-text-muted) truncate mt-0.5">{sender.emailCount.toLocaleString()} emails</p>
										</div>

										{/* Category */}
										<span
											className={cn(
												'hidden sm:inline-flex shrink-0 items-center px-2 py-0.5 rounded-md text-xs border font-mono',
												CATEGORY_COLORS[sender.category],
											)}
										>
											{sender.category}
										</span>

										{/* Check */}
										<span
											aria-hidden="true"
											className={cn(
												'h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-150',
												isSelected ? 'bg-(--color-accent) border-(--color-accent) text-white' : 'border-(--color-border)',
											)}
										>
											{isSelected && (
												<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.15 }}>
													<CheckCircle size={12} />
												</motion.span>
											)}
										</span>
									</button>
								</motion.li>
							);
						})}
					</motion.ul>
				</section>
			</div>
		</div>
	);
}
