'use client';

import { cn } from '@/lib/cn';
import { fadeUp } from '@/lib/motion';
import { motion } from 'framer-motion';
import { Inbox, LogIn, ScanLine, Sliders } from 'lucide-react';

const STEPS = [
	{
		icon: LogIn,
		step: '01',
		title: 'Connect Gmail',
		description: 'Sign in with Google. Minimum OAuth scopes only — read and modify. We never store your email content.',
	},
	{
		icon: ScanLine,
		step: '02',
		title: 'We scan your inbox',
		description: "InboxRift analyses 90 days of email headers, groups every sender by type, and surfaces what's cluttering your inbox.",
	},
	{
		icon: Sliders,
		step: '03',
		title: 'You choose what stays',
		description: 'Unsubscribe in bulk. Pick newsletters for your digest. Takes under two minutes.',
	},
	{
		icon: Inbox,
		step: '04',
		title: 'Enjoy the quiet',
		description: 'One digest email at your chosen time. Everything else is gone. Inbox zero on autopilot.',
	},
] as const;

function Step({
	icon: Icon,
	step,
	title,
	description,
	index,
}: {
	icon: typeof LogIn;
	step: string;
	title: string;
	description: string;
	index: number;
}) {
	return (
		<motion.li
			variants={fadeUp(index * 0.1)}
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: '-80px' }}
			className="grid grid-cols-[48px_1fr] gap-6 group"
		>
			{/* Node + line */}
			<div className="flex flex-col items-center">
				<div
					className={cn(
						'flex h-11 w-11 items-center justify-center rounded-full shrink-0 z-10',
						'border border-(--color-border) bg-(--color-surface-2)',
						'group-hover:border-(--color-accent-border) group-hover:bg-(--color-accent-muted)',
						'transition-all duration-300',
					)}
				>
					<Icon
						size={18}
						aria-hidden="true"
						className="text-(--color-text-muted) group-hover:text-(--color-accent) transition-colors duration-300"
					/>
				</div>
				{index < STEPS.length - 1 && (
					<div className="w-px flex-1 mt-2 bg-(--color-border) group-hover:bg-(--color-accent-border) transition-colors duration-300" />
				)}
			</div>

			{/* Content */}
			<div className={cn('pb-12', index === STEPS.length - 1 && 'pb-0')}>
				<div className="flex items-center gap-2.5 mb-2">
					<span className="text-xs font-mono text-(--color-accent)">{step}</span>
					<h3 className="font-display font-bold text-(--color-text-primary) tracking-tight">{title}</h3>
				</div>
				<p className="text-sm text-(--color-text-muted) leading-relaxed max-w-sm">{description}</p>
			</div>
		</motion.li>
	);
}

export default function HowItWorks() {
	return (
		<section id="how-it-works" aria-labelledby="how-heading" className="py-24 px-5 border-t border-(--color-border)">
			<div className="mx-auto max-w-6xl">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
					{/* Left — sticky header */}
					<div className="lg:sticky lg:top-24">
						<p className="text-xs font-mono text-(--color-accent) uppercase tracking-[0.12em] mb-3">How it works</p>
						<h2 id="how-heading" className="text-3xl sm:text-4xl font-display font-bold text-(--color-text-primary) tracking-tight mb-6">
							From chaos to
							<br />
							clarity in minutes
						</h2>
						<p className="text-sm text-(--color-text-muted) leading-relaxed max-w-sm">
							Four steps. Under two minutes to set up. Then InboxRift runs silently every day while you focus on everything else.
						</p>

						{/* Mini stat */}
						<div className="mt-8 inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-(--color-surface) border border-(--color-border)">
							<div className="flex flex-col">
								<span className="font-display font-black text-2xl text-(--color-accent) leading-none tracking-tight">60s</span>
								<span className="text-xs text-(--color-text-muted) mt-0.5">average setup time</span>
							</div>
							<div className="w-px h-10 bg-(--color-border)" />
							<div className="flex flex-col">
								<span className="font-display font-black text-2xl text-(--color-text-primary) leading-none tracking-tight">94%</span>
								<span className="text-xs text-(--color-text-muted) mt-0.5">noise reduction</span>
							</div>
						</div>
					</div>

					{/* Right — timeline */}
					<ol aria-label="Steps to get started with InboxRift" className="flex flex-col mt-2">
						{STEPS.map(({ icon, step, title, description }, i) => (
							<Step key={step} icon={icon} step={step} title={title} description={description} index={i} />
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}
