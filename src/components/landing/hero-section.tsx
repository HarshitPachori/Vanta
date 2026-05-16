'use client';
import HeroAnimation from '@/components/landing/hero-animation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Suspense } from 'react';

export default function HeroSection() {
	return (
		<section aria-labelledby="hero-heading" className="relative min-h-dvh flex items-center px-5 pt-20 pb-16 overflow-hidden">
			{/* Amber bloom */}
			<div
				aria-hidden="true"
				className="absolute top-0 right-0 w-150 h-150 pointer-events-none"
				style={{
					background: 'radial-gradient(ellipse at 80% 10%, rgba(249,115,22,0.07) 0%, transparent 65%)',
				}}
			/>

			{/* Bezier decoration — amber */}
			<svg
				aria-hidden="true"
				className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]"
				preserveAspectRatio="none"
				viewBox="0 0 1440 900"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M0,700 C300,550 600,800 900,500 C1100,320 1300,400 1440,300"
					fill="none"
					stroke="#F97316"
					strokeWidth="1.5"
					strokeDasharray="8 8"
				/>
				<path d="M0,800 C400,650 800,850 1200,600 C1320,530 1400,480 1440,450" fill="none" stroke="#F97316" strokeWidth="0.75" />
			</svg>

			<div className="relative z-10 mx-auto max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
				{/* Left */}
				<div className="flex flex-col gap-6">
					{/* Eyebrow */}
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
						className="flex items-center gap-2 w-fit"
					>
						<span className="flex h-1.5 w-1.5 rounded-full bg-(--color-accent) pulse-dot" aria-hidden="true" />
						<span className="text-xs font-mono text-(--color-accent) uppercase tracking-[0.12em]">Early access open</span>
					</motion.div>

					{/* Heading */}
					<motion.h1
						id="hero-heading"
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.55, ease: [0, 0, 0.2, 1], delay: 0.05 }}
						className="font-display font-black text-5xl sm:text-6xl lg:text-[4.25rem] leading-[1.02] tracking-[-0.04em] text-(--color-text-primary)"
					>
						Your inbox, <em className="not-italic text-gradient">finally quiet.</em>
					</motion.h1>

					{/* Sub */}
					<motion.p
						initial={{ opacity: 0, y: 14 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay: 0.12 }}
						className=" sm:text-lg text-(--color-text-muted) leading-relaxed max-w-lg"
					>
						InboxRift scans your Gmail, kills the noise, and rebuilds what you actually want to read into one clean daily digest.
					</motion.p>

					{/* CTA */}
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay: 0.18 }}
						className="flex flex-col sm:flex-row items-start gap-3"
					>
						<Button size="lg" className="shadow-(--shadow-glow)">
							<Link href="/signup">Connect Gmail — it's free</Link>
						</Button>
						<Button variant="outline" size="lg">
							<Link href="/#how-it-works">See how it works</Link>
						</Button>
					</motion.div>

					{/* Trust line */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.28 }}
						className="flex items-center gap-3 text-xs text-(--color-text-muted) font-mono"
					>
						<span>No credit card</span>
						<span aria-hidden="true" className="h-3 w-px bg-(--color-border)" />
						<span>Gmail only</span>
						<span aria-hidden="true" className="h-3 w-px bg-(--color-border)" />
						<span>Cancel anytime</span>
					</motion.div>

					{/* Live counter */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.45, delay: 0.35 }}
						className="flex items-center gap-2 w-fit px-3 py-2 rounded-lg bg-(--color-surface) border border-(--color-border)"
					>
						<span className="font-display font-black text-(--color-accent) text-lg leading-none tracking-tight">12,847</span>
						<span className="text-xs text-(--color-text-muted)">inboxes cleaned</span>
					</motion.div>
				</div>

				{/* Right — animated inbox */}
				<motion.div
					initial={{ opacity: 0, x: 24 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.65, ease: [0, 0, 0.2, 1], delay: 0.1 }}
				>
					<Suspense fallback={<div className="h-105 rounded-2xl bg-(--color-surface) border border-(--color-border) animate-pulse" />}>
						<HeroAnimation />
					</Suspense>
				</motion.div>
			</div>
		</section>
	);
}
