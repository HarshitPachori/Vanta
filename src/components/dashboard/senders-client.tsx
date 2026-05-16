'use client';

import { useState, useMemo, useTransition, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Layers, Search, Loader, CheckCircle, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	cn,
	cardSection,
	iconSquare,
	pillAccent,
	pillDanger,
	pillNeutral,
	pillSuccess,
	tableHeaderCell,
	tableRow,
	tableCell,
} from '@/lib/cn';
import { stagger, fadeUp } from '@/lib/motion';
import type { Sender } from '@backend/db/schema';
import EmptyState from './empty-state';
import Link from 'next/link';

type InitialJob = { id: string; senderId: string; status: JobStatus };
type Props = { initialSenders: Sender[]; initialJobs: InitialJob[] };

type JobStatus = 'queued' | 'processing' | 'done' | 'failed';
type JobState = Record<string, { jobId: string; status: JobStatus }>; // senderId → job

const CATEGORIES = ['all', 'newsletter', 'promo', 'social', 'transactional', 'cold', 'other'] as const;

const CATEGORY_PILL: Record<string, string> = {
	newsletter: pillAccent,
	promo:
		'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border bg-(--color-warning-muted) text-(--color-warning) border-amber-700/20',
	social: pillNeutral,
	transactional: pillSuccess,
	cold: pillDanger,
	other: pillNeutral,
};

export default function SendersClient({ initialSenders, initialJobs }: Props) {
	const [senderList, setSenderList] = useState(initialSenders);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [search, setSearch] = useState('');
	const [category, setCategory] = useState<string>('all');
	const [pending, startTransition] = useTransition();
	const [digestSuccess, setDigestSuccess] = useState(false);
	const [jobState, setJobState] = useState<JobState>(() => {
		const state: JobState = {};
		for (const job of initialJobs) {
			state[job.senderId] = { jobId: job.id, status: job.status };
		}
		return state;
	});
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const stopPolling = useCallback(() => {
		if (pollRef.current) {
			clearInterval(pollRef.current);
			pollRef.current = null;
		}
	}, []);

	useEffect(() => () => stopPolling(), [stopPolling]);

	useEffect(() => {
		const hasActive = initialJobs.some((j) => j.status === 'queued' || j.status === 'processing');
		if (hasActive) {
			pollRef.current = setInterval(() => {
				setJobState((curr) => {
					pollJobs(curr);
					return curr;
				});
			}, 3000);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const pollJobs = useCallback(
		async (currentJobs: JobState) => {
			const pending = Object.values(currentJobs).filter((j) => j.status === 'queued' || j.status === 'processing');
			if (!pending.length) {
				stopPolling();
				return;
			}

			const ids = pending.map((j) => j.jobId).join(',');
			try {
				const res = await fetch(`/api/senders/jobs?ids=${ids}`);
				if (!res.ok) return;
				const data = (await res.json()) as { jobs: Array<{ id: string; senderId: string; status: JobStatus }> };

				setJobState((prev) => {
					const next = { ...prev };
					let allDone = true;
					for (const job of data.jobs) {
						if (next[job.senderId]) {
							next[job.senderId] = { ...next[job.senderId], status: job.status };
							if (job.status === 'done') {
								setSenderList((s) => s.map((sender) => (sender.id === job.senderId ? { ...sender, status: 'unsubscribed' } : sender)));
							}
						}
						if (job.status !== 'done' && job.status !== 'failed') allDone = false;
					}
					if (allDone) stopPolling();
					return next;
				});
			} catch {}
		},
		[stopPolling],
	);

	const filtered = useMemo(
		() =>
			senderList.filter((s) => {
				if (category !== 'all' && s.category !== category) return false;
				if (search && !s.email.toLowerCase().includes(search.toLowerCase()) && !s.displayName?.toLowerCase().includes(search.toLowerCase()))
					return false;
				return true;
			}),
		[senderList, category, search],
	);

	const toggleSelect = (id: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	};

	const canSelect = (s: Sender) => s.status !== 'unsubscribed' && !!s.unsubscribeUrl;

	const selectableFiltered = useMemo(() => filtered.filter(canSelect), [filtered]);

	const toggleAll = () => {
		setSelected(selected.size === selectableFiltered.length ? new Set() : new Set(selectableFiltered.map((s) => s.id)));
	};

	const unsubscribeSelected = () => {
		startTransition(async () => {
			try {
				const res = await fetch('/api/senders/unsubscribe', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ senderIds: Array.from(selected) }),
				});
				if (!res.ok) return;
				const data = (await res.json()) as { jobs: Array<{ jobId: string; senderId: string }> };

				const initial: JobState = {};
				for (const { jobId, senderId } of data.jobs) {
					initial[senderId] = { jobId, status: 'queued' };
				}
				setJobState((prev) => ({ ...prev, ...initial }));
				setSelected(new Set());

				stopPolling();
				pollRef.current = setInterval(() => {
					setJobState((curr) => {
						pollJobs(curr);
						return curr;
					});
				}, 3000);
			} catch {}
		});
	};

	const addToDigest = () => {
		startTransition(async () => {
			try {
				const res = await fetch('/api/digest/senders', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ senderIds: Array.from(selected) }),
				});
				if (res.ok) {
					setSenderList((prev) => prev.map((s) => (selected.has(s.id) ? { ...s, status: 'in_digest' } : s)));
					setSelected(new Set());
					setDigestSuccess(true);
					setTimeout(() => setDigestSuccess(false), 3000);
				}
			} catch {}
		});
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Banners */}
			<AnimatePresence>
				{(() => {
					const jobs = Object.values(jobState);
					const active = jobs.filter((j) => j.status === 'queued' || j.status === 'processing').length;
					const done = jobs.filter((j) => j.status === 'done').length;
					const failed = jobs.filter((j) => j.status === 'failed').length;
					const total = jobs.length;
					if (!total) return null;
					if (active > 0)
						return (
							<motion.div
								key="unsub-progress"
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								role="status"
								className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-(--color-accent-muted) border border-(--color-accent-border) text-sm text-(--color-accent)"
							>
								<Loader size={14} className="animate-spin" aria-hidden="true" />
								Unsubscribing {active} sender{active !== 1 ? 's' : ''}… {done > 0 && `(${done} done)`}
							</motion.div>
						);
					return (
						<motion.div
							key="unsub-done"
							initial={{ opacity: 0, y: -8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							role="status"
							className={cn(
								'flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm border',
								failed > 0
									? 'bg-(--color-danger-muted) border-[rgba(239,68,68,0.2)] text-(--color-danger)'
									: 'bg-(--color-success-muted) border-[rgba(34,197,94,0.2)] text-(--color-success)',
							)}
						>
							{failed > 0 ? <AlertCircle size={14} aria-hidden="true" /> : <CheckCircle size={14} aria-hidden="true" />}
							{done > 0 && `${done} unsubscribed`}
							{done > 0 && failed > 0 && ', '}
							{failed > 0 && `${failed} failed`}.
						</motion.div>
					);
				})()}
				{digestSuccess && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						role="status"
						className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-(--color-accent-muted) border border-(--color-accent-border) text-sm text-(--color-accent)"
					>
						<Layers size={14} aria-hidden="true" />
						Added to digest.
					</motion.div>
				)}
			</AnimatePresence>

			{/* Toolbar */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" aria-hidden="true" />
					<Input
						placeholder="Search senders…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9 h-9 text-sm"
						aria-label="Search senders"
					/>
				</div>
				<div className="flex gap-1.5 flex-wrap">
					{CATEGORIES.map((cat) => (
						<button
							key={cat}
							onClick={() => setCategory(cat)}
							className={cn(
								'px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all duration-120 border',
								category === cat
									? 'bg-(--color-accent-muted) text-(--color-accent) border-(--color-accent-border)'
									: 'text-(--color-text-muted) border-(--color-border) hover:text-(--color-text-secondary) hover:bg-white/4',
							)}
						>
							{cat}
						</button>
					))}
				</div>
			</div>

			{/* Bulk action bar */}
			<AnimatePresence>
				{selected.size > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 8 }}
						className={cn(cardSection, 'flex items-center justify-between px-4 py-2.5')}
					>
						<span className="text-[13px] text-(--color-text-muted)">
							<span className="font-semibold text-(--color-text-primary)">{selected.size}</span> selected
						</span>
						<div className="flex items-center gap-2">
							<Button size="sm" variant="outline" onClick={addToDigest} disabled={pending} className="gap-1.5 h-7 text-xs">
								{pending ? <Loader size={12} className="animate-spin" /> : <Layers size={12} />}
								Add to digest
							</Button>
							<Button size="sm" onClick={unsubscribeSelected} disabled={pending} className="gap-1.5 h-7 text-xs">
								{pending ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}
								Unsubscribe {selected.size}
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Empty state */}
			{filtered.length === 0 && (
				<EmptyState
					icon={Mail}
					title={senderList.length === 0 ? 'No senders yet' : 'No matches'}
					description={
						senderList.length === 0 ? 'Scan your inbox to detect senders. It takes under 60 seconds.' : 'No senders match your filters.'
					}
					action={
						senderList.length === 0 ? (
							<Button size="sm">
								<Link href="/dashboard">Go to overview</Link>
							</Button>
						) : undefined
					}
				/>
			)}

			{/* Table */}
			{filtered.length > 0 && (
				<div className={cn(cardSection, 'overflow-hidden')}>
					<table className="w-full">
						<thead>
							<tr className="border-b border-(--color-border)">
								<th className={cn(tableHeaderCell, 'w-10')}>
									<input
										type="checkbox"
										checked={selected.size === selectableFiltered.length && selectableFiltered.length > 0}
										onChange={toggleAll}
										aria-label="Select all"
										className="h-3.5 w-3.5 rounded accent-orange-500"
									/>
								</th>
								<th className={tableHeaderCell}>Sender</th>
								<th className={cn(tableHeaderCell, 'hidden sm:table-cell text-right')}>Emails</th>
								<th className={cn(tableHeaderCell, 'hidden md:table-cell')}>Category</th>
								<th className={cn(tableHeaderCell, 'text-right')}>Status</th>
								<th className={cn(tableHeaderCell, 'w-8')} />
							</tr>
						</thead>

						<motion.tbody variants={stagger(0.03)} initial="hidden" animate="show">
							{filtered.map((sender) => (
								<motion.tr
									key={sender.id}
									variants={fadeUp(0)}
									className={cn(
										tableRow,
										selected.has(sender.id) && 'bg-(--color-accent-muted)',
										(sender.status === 'unsubscribed' || !canSelect(sender)) && 'opacity-50',
									)}
								>
									{/* Checkbox */}
									<td className={cn(tableCell, 'w-10')}>
										<input
											type="checkbox"
											checked={selected.has(sender.id)}
											onChange={() => toggleSelect(sender.id)}
											disabled={!canSelect(sender)}
											aria-label={`Select ${sender.displayName ?? sender.email}`}
											className={cn('h-3.5 w-3.5 rounded accent-orange-500', !canSelect(sender) && 'cursor-not-allowed')}
										/>
									</td>

									{/* Sender name + email */}
									<td className={tableCell}>
										<div className="flex items-center gap-3">
											{/* Avatar icon square */}
											<span
												className={iconSquare(
													'bg-(--color-surface-3) border border-(--color-border) text-(--color-text-muted) font-bold font-display text-xs',
												)}
											>
												{(sender.displayName ?? sender.email)[0].toUpperCase()}
											</span>
											<div className="min-w-0">
												<p className="text-[13px] font-medium text-(--color-text-primary) truncate leading-tight">
													{sender.displayName ?? sender.email}
												</p>
												<p className="text-[11px] text-(--color-text-muted) truncate font-mono">{sender.email}</p>
											</div>
										</div>
									</td>

									{/* Email count */}
									<td className={cn(tableCell, 'hidden sm:table-cell text-right font-mono text-[12px]')}>
										{sender.emailCount.toLocaleString()}
									</td>

									{/* Category */}
									<td className={cn(tableCell, 'hidden md:table-cell')}>
										<span className={CATEGORY_PILL[sender.category] ?? pillNeutral}>{sender.category}</span>
									</td>

									{/* Status */}
									<td className={cn(tableCell, 'text-right')}>
										{(() => {
											const job = jobState[sender.id];
											if (job?.status === 'queued' || job?.status === 'processing')
												return (
													<span className={cn(pillNeutral, 'gap-1')}>
														<Loader size={10} className="animate-spin" />
														processing
													</span>
												);
											if (job?.status === 'failed') return <span className={pillDanger}>failed</span>;
											if (sender.status === 'unsubscribed') return <span className={pillDanger}>unsub</span>;
											if (sender.status === 'in_digest') return <span className={pillSuccess}>digest</span>;
											if (!sender.unsubscribeUrl)
												return (
													<span className={pillNeutral} title="No HTTP unsubscribe link found in emails">
														no link
													</span>
												);
											return <span className={pillNeutral}>active</span>;
										})()}
									</td>

									{/* Actions placeholder */}
									<td className={cn(tableCell, 'w-8')} />
								</motion.tr>
							))}
						</motion.tbody>
					</table>

					{/* Pagination footer */}
					<div className="px-4 py-2.5 border-t border-(--color-border) flex items-center justify-between">
						<p className="text-[11px] font-mono text-(--color-text-muted)">
							{filtered.length} of {senderList.length} senders
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
