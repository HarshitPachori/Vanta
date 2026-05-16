'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Loader, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, glassAvatar } from '@/lib/cn';
import { fadeUp } from '@/lib/motion';

export default function DeleteAccountButton() {
	const [open, setOpen] = useState(false);
	const [confirm, setConfirm] = useState('');
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const handleDelete = () => {
		if (confirm !== 'delete my account') return;
		startTransition(async () => {
			try {
				const res = await fetch('/api/account', { method: 'DELETE' });
				if (res.ok) {
					window.location.href = '/?deleted=true';
				} else {
					const body = await res.json<{ error: string }>();
					setError(body.error ?? 'Failed to delete account.');
				}
			} catch {
				setError('Something went wrong. Please try again.');
			}
		});
	};

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => setOpen(true)}
				className="border-(--color-danger)/30 text-(--color-danger) hover:bg-(--color-danger-muted) hover:border-(--color-danger)/50"
			>
				<Trash2 size={13} aria-hidden="true" />
				Delete account
			</Button>

			{/* Confirmation modal */}
			<AnimatePresence>
				{open && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
							onClick={() => !pending && setOpen(false)}
							aria-hidden="true"
						/>

						{/* Dialog */}
						<div
							role="dialog"
							aria-modal="true"
							aria-labelledby="delete-dialog-title"
							className="fixed inset-0 z-50 flex items-center justify-center p-4"
						>
							<motion.div
								variants={fadeUp()}
								initial="hidden"
								animate="show"
								exit={{ opacity: 0, y: 8 }}
								className="w-full max-w-md bg-(--color-surface) border border-(--color-danger)/30 rounded-2xl p-6 flex flex-col gap-5"
							>
								{/* Header */}
								<div className="flex items-start gap-3">
									<span
										aria-hidden="true"
										className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--color-danger-muted) border border-(--color-danger)/20"
									>
										<AlertTriangle size={18} className="text-(--color-danger)" />
									</span>
									<div>
										<h2 id="delete-dialog-title" className="font-display font-bold text-(--color-text-primary) tracking-tight">
											Delete your account
										</h2>
										<p className="text-sm text-(--color-text-muted) mt-1 leading-relaxed">
											This permanently deletes all your data — senders, digest config, and scan history. This cannot be undone.
										</p>
									</div>
								</div>

								{/* Confirmation input */}
								<div className="flex flex-col gap-2">
									<label htmlFor="confirm-delete" className="text-sm text-(--color-text-secondary)">
										Type <span className="font-mono text-(--color-danger) text-xs">delete my account</span> to confirm
									</label>
									<Input
										id="confirm-delete"
										value={confirm}
										onChange={(e) => setConfirm(e.target.value)}
										placeholder="delete my account"
										disabled={pending}
										autoComplete="off"
										className={cn('font-mono text-sm', confirm === 'delete my account' && 'border-(--color-danger)/40')}
									/>
								</div>

								{/* Error */}
								{error && (
									<p role="alert" className="text-sm text-(--color-danger)">
										{error}
									</p>
								)}

								{/* Actions */}
								<div className="flex gap-3 justify-end">
									<Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={pending}>
										Cancel
									</Button>
									<Button
										type="button"
										size="sm"
										onClick={handleDelete}
										disabled={confirm !== 'delete my account' || pending}
										className="bg-(--color-danger) hover:bg-red-600 text-white border-transparent"
									>
										{pending ? <Loader size={13} className="animate-spin" aria-hidden="true" /> : <Trash2 size={13} aria-hidden="true" />}
										{pending ? 'Deleting…' : 'Delete permanently'}
									</Button>
								</div>
							</motion.div>
						</div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}
