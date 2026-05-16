import type { LucideIcon } from 'lucide-react';
import { cn, iconSquare } from '@/lib/cn';

type Props = {
	icon: LucideIcon;
	title: string;
	description: string;
	action?: React.ReactNode;
	className?: string;
};

export default function EmptyState({ icon: Icon, title, description, action, className }: Props) {
	return (
		<div className={cn('flex flex-col items-center justify-center text-center py-16 px-4 gap-4', className)}>
			<span aria-hidden="true" className={iconSquare('bg-(--color-surface-2) border border-(--color-border)', 'w-14 h-14 rounded-2xl')}>
				<Icon size={24} className="text-(--color-text-muted)" />
			</span>
			<div>
				<h3 className="font-display font-bold text-(--color-text-primary) tracking-tight">{title}</h3>
				<p className="text-sm text-(--color-text-muted) mt-1 max-w-xs leading-relaxed">{description}</p>
			</div>
			{action && <div className="mt-2">{action}</div>}
		</div>
	);
}
