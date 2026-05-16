'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fadeUp } from '@/lib/motion';

export default function ForgotPasswordForm() {
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		const email = new FormData(e.currentTarget).get('email') as string;

		startTransition(async () => {
			try {
				const res = await fetch('/api/auth/forgot-password', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email }),
				});
				if (res.ok) {
					setSent(true);
				} else {
					const body = await res.json<{ error: string }>();
					setError(body.error ?? 'Something went wrong.');
				}
			} catch {
				setError('Something went wrong. Please try again.');
			}
		});
	};

	return (
		<AnimatePresence mode="wait">
			{sent ? (
				<motion.div
					key="sent"
					variants={fadeUp()}
					initial="hidden"
					animate="show"
					className="flex flex-col items-center gap-4 text-center py-4"
				>
					<span
						aria-hidden="true"
						className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-success-muted) border border-(--color-success)/20"
					>
						<CheckCircle size={24} className="text-(--color-success)" />
					</span>
					<div>
						<p className="font-display font-bold text-(--color-text-primary) tracking-tight">Check your email</p>
						<p className="text-sm text-(--color-text-muted) mt-2 leading-relaxed">
							If that email is registered, a reset link is on its way. Check your spam folder if you don't see it.
						</p>
						<button
							type="button"
							onClick={() => setSent(false)}
							className="text-sm text-(--color-accent) hover:text-(--color-accent-hover) transition-colors duration-150 font-medium"
						>
							Resend email
						</button>
					</div>
				</motion.div>
			) : (
				<motion.form
					key="form"
					variants={fadeUp()}
					initial="hidden"
					animate="show"
					onSubmit={handleSubmit}
					noValidate
					aria-label="Forgot password form"
					className="flex flex-col gap-4"
				>
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -4 }}
							animate={{ opacity: 1, y: 0 }}
							role="alert"
							aria-live="assertive"
							className="rounded-lg px-4 py-3 text-sm bg-(--color-danger-muted) text-(--color-danger) border border-(--color-danger)/20"
						>
							{error}
						</motion.div>
					)}

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="email" className="text-sm text-(--color-text-secondary)">
							Email address
						</Label>
						<div className="relative">
							<Mail aria-hidden="true" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />
							<Input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								placeholder="you@example.com"
								className="pl-9"
								disabled={pending}
							/>
						</div>
					</div>

					<Button type="submit" className="w-full mt-1" disabled={pending} aria-busy={pending}>
						{pending ? (
							<>
								<Loader size={15} className="animate-spin" aria-hidden="true" /> Sending…
							</>
						) : (
							'Send reset link'
						)}
					</Button>
				</motion.form>
			)}
		</AnimatePresence>
	);
}
