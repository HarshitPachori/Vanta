'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function DashboardErrorBoundary({ error, reset }: Props) {
	useEffect(() => {
		console.error('Dashboard error:', error);
	}, [error]);

	return (
		<div className="px-5 sm:px-8 py-16 max-w-4xl mx-auto flex flex-col items-center text-center gap-5">
			<span
				aria-hidden="true"
				className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-danger-muted) border border-(--color-danger)/20"
			>
				<AlertCircle size={24} className="text-(--color-danger)" />
			</span>
			<div>
				<h2 className="font-display font-bold text-lg text-(--color-text-primary) tracking-tight">Something went wrong</h2>
				<p className="text-sm text-(--color-text-muted) mt-2 max-w-sm leading-relaxed">
					An error occurred loading this page. Try refreshing or come back later.
				</p>
				{error.digest && <p className="text-xs font-mono text-(--color-text-muted) mt-2">Error: {error.digest}</p>}
			</div>
			<Button onClick={reset} variant="outline" className="gap-2">
				<RefreshCw size={14} aria-hidden="true" />
				Try again
			</Button>
		</div>
	);
}
