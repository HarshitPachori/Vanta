'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/cn';
import { fadeUp } from '@/lib/motion';
import Link from 'next/link';
import GoogleButton from '@/components/auth/google-button';

export function LoginForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		const data = new FormData(e.currentTarget);
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			if (!res.ok) {
				const body: { error: string } = await res.json();
				setError(body.error ?? 'Invalid email or password.');
				return;
			}

			const body = await res.json<{ redirect?: string }>();
			window.location.href = body.redirect ?? '/dashboard';
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<motion.div variants={fadeUp()} initial="hidden" animate="show" className="flex flex-col gap-4">
			{/* Google OAuth — primary CTA */}
			<GoogleButton action="login" />

			{/* Divider */}
			<div className="relative flex items-center gap-3" role="separator">
				<div className="flex-1 h-px bg-(--color-border)" />
				<span className="text-xs text-(--color-text-muted) shrink-0">or continue with email</span>
				<div className="flex-1 h-px bg-(--color-border)" />
			</div>

			{/* Email + password form */}
			<form onSubmit={handleSubmit} noValidate aria-label="Login form" className="flex flex-col gap-4">
				{/* Error */}
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

				{/* Email */}
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="email" className="text-sm text-(--color-text-secondary)">
						Email
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
							disabled={loading}
						/>
					</div>
				</div>

				{/* Password */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<Label htmlFor="password" className="text-sm text-(--color-text-secondary)">
							Password
						</Label>
						<Link
							href="/forgot-password"
							className="text-xs text-(--color-text-muted) hover:text-(--color-text-secondary) transition-colors duration-150"
						>
							Forgot password?
						</Link>
					</div>
					<div className="relative">
						<Lock aria-hidden="true" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />
						<Input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							autoComplete="current-password"
							required
							placeholder="••••••••"
							className="pl-9 pr-10"
							disabled={loading}
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
				</div>

				<Button type="submit" className="w-full mt-1" disabled={loading} aria-busy={loading}>
					{loading ? (
						<>
							<Loader2 size={15} className="animate-spin" aria-hidden="true" /> Logging in…
						</>
					) : (
						'Log in'
					)}
				</Button>
			</form>
		</motion.div>
	);
}
