'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/cn';
import { fadeUp } from '@/lib/motion';
import Link from 'next/link';

type Props = { token: string };

export default function ResetPasswordForm({ token }: Props) {
	const [showPassword, setShowPassword] = useState(false);
	const [done, setDone] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		const password = new FormData(e.currentTarget).get('password') as string;

		if (password.length < 8) {
			setError('Password must be at least 8 characters.');
			return;
		}

		startTransition(async () => {
			try {
				const res = await fetch('/api/auth/reset-password', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ token, password }),
				});
				if (res.ok) {
					setDone(true);
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
			{done ? (
				<motion.div
					key="done"
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
						<p className="font-display font-bold text-(--color-text-primary) tracking-tight">Password updated</p>
						<p className="text-sm text-(--color-text-muted) mt-2">Your password has been changed. You can now log in.</p>
					</div>
					<Button className="mt-2">
						<Link href="/login">Go to log in</Link>
					</Button>
				</motion.div>
			) : (
				<motion.form
					key="form"
					variants={fadeUp()}
					initial="hidden"
					animate="show"
					onSubmit={handleSubmit}
					noValidate
					aria-label="Reset password form"
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
						<Label htmlFor="password" className="text-sm text-(--color-text-secondary)">
							New password
						</Label>
						<div className="relative">
							<Lock aria-hidden="true" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />
							<Input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								autoComplete="new-password"
								required
								minLength={8}
								placeholder="Min. 8 characters"
								className="pl-9 pr-10"
								disabled={pending}
							/>
							<button
								type="button"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
								onClick={() => setShowPassword((v) => !v)}
								className={cn(
									'absolute right-3 top-1/2 -translate-y-1/2',
									'text-(--color-text-muted) hover:text-(--color-text-secondary)',
									'transition-colors duration-150',
								)}
							>
								{showPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
							</button>
						</div>
						<p className="text-xs text-(--color-text-muted)">Minimum 8 characters</p>
					</div>

					<Button type="submit" className="w-full mt-1" disabled={pending} aria-busy={pending}>
						{pending ? (
							<>
								<Loader size={15} className="animate-spin" aria-hidden="true" /> Updating…
							</>
						) : (
							'Update password'
						)}
					</Button>
				</motion.form>
			)}
		</AnimatePresence>
	);
}
