import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Glass effect — Resend avatar/pill style
export const glasspill = cn(
	'bg-gradient-to-br from-white/[0.07] to-white/[0.02]',
	'border border-white/[0.08]',
	'shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.3)]',
	'backdrop-blur-sm',
);

// Glass avatar — the H avatar effect
export const glassAvatar = cn(
	'bg-gradient-to-br from-white/[0.12] via-white/[0.03] to-black/20',
	'border border-white/10',
	'shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.4)]',
);

// Card section
export const cardSection = cn(
	'bg-(--color-surface)',
	'border border-(--color-border)',
	'rounded-xl',
	'shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_1px_3px_rgba(0,0,0,0.4)]',
);

// Metric card
export const metricCard = cn(
	'bg-(--color-surface)',
	'border border-(--color-border)',
	'rounded-xl p-5',
	'shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_1px_3px_rgba(0,0,0,0.4)]',
	'transition-colors duration-[120ms]',
	'hover:border-(--color-surface-3)',
);

// Nav item base + active
export const navItem = cn(
	'flex items-center gap-2.5 px-2.5 py-2 rounded-md',
	'text-[13px] font-medium',
	'text-(--color-text-muted)',
	'transition-all duration-[120ms]',
	'hover:text-(--color-text-secondary) hover:bg-white/[0.04]',
);
export const navItemActive = cn(
	navItem,
	'text-(--color-accent) bg-(--color-accent-muted)',
	'hover:text-(--color-accent) hover:bg-(--color-accent-muted)',
);

// Status pills
export const pill = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border';
export const pillSuccess = cn(pill, 'bg-(--color-success-muted) text-(--color-success) border-[rgba(34,197,94,0.2)]');
export const pillDanger = cn(pill, 'bg-(--color-danger-muted) text-(--color-danger) border-[rgba(239,68,68,0.2)]');
export const pillAccent = cn(pill, 'bg-(--color-accent-muted) text-(--color-accent) border-(--color-accent-border)');
export const pillNeutral = cn(pill, 'bg-white/[0.04] text-(--color-text-muted) border-(--color-border)');

// Skeleton shimmer
export const skeleton = cn(
	'bg-gradient-to-r from-(--color-surface-2) via-(--color-surface-3) to-(--color-surface-2)',
	'bg-[length:200%_100%]',
	'animate-[skeleton-shimmer_1.5s_ease-in-out_infinite]',
	'rounded-md',
);

// Icon square
export const iconSquare = (color: string, size = 'w-8 h-8 rounded-lg') =>
	cn(
		'inline-flex items-center justify-center shrink-0',
		'shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_3px_rgba(0,0,0,0.3)]',
		size,
		color,
	);

// Table
export const tableHeaderCell =
	'px-4 py-2.5 text-[11px] font-mono font-medium text-(--color-text-muted) uppercase tracking-[0.06em] text-left whitespace-nowrap';
export const tableRow = 'border-b border-(--color-border-subtle) last:border-b-0 transition-colors duration-[120ms] hover:bg-white/[0.02]';
export const tableCell = 'px-4 py-3 text-[13px] text-(--color-text-secondary) whitespace-nowrap';
