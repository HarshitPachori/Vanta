'use client';

import { Button } from '@/components/ui/button';
import { cn, glasspill } from '@/lib/cn';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const GOOGLE_ICON = (
	<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.67 3.67 0 0 1-1.59 2.41v2h2.57c1.5-1.38 2.4-3.42 2.4-5.87Z" fill="#4285F4" />
		<path
			d="M8 16c2.16 0 3.97-.72 5.29-1.94l-2.57-2a4.8 4.8 0 0 1-2.72.75 4.79 4.79 0 0 1-4.5-3.32H.87v2.06A8 8 0 0 0 8 16Z"
			fill="#34A853"
		/>
		<path
			d="M3.5 9.49A4.83 4.83 0 0 1 3.25 8c0-.52.09-1.02.25-1.49V4.45H.87A8.01 8.01 0 0 0 0 8c0 1.29.31 2.51.87 3.55l2.63-2.06Z"
			fill="#FBBC05"
		/>
		<path
			d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.37-2.37A7.97 7.97 0 0 0 8 0 8 8 0 0 0 .87 4.45L3.5 6.51A4.79 4.79 0 0 1 8 3.18Z"
			fill="#EA4335"
		/>
	</svg>
);

type Props = {
	action: 'login' | 'signup';
};

export default function GoogleButton({ action }: Props) {
	const [loading, setLoading] = useState(false);

	const handleClick = () => {
		setLoading(true);
		window.location.href = '/api/auth/google';
	};

	return (
		<Button
			type="button"
			variant="outline"
			className={cn(
				glasspill,
				'w-full gap-2',
				'border-(--color-border) bg-(--color-surface-2)',
				'hover:bg-(--color-surface-3) hover:border-(--color-border)',
				'text-(--color-text-primary) transition-colors duration-150',
			)}
			onClick={handleClick}
			disabled={loading}
			aria-busy={loading}
			aria-label={`${action === 'login' ? 'Log in' : 'Sign up'} with Google`}
		>
			{loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : GOOGLE_ICON}
			<span className="font-medium">{action === 'login' ? 'Log in with Google' : 'Sign up with Google'}</span>
		</Button>
	);
}
