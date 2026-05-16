import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<InputPrimitive
			type={type}
			data-slot="input"
			className={cn(
				'flex h-10 w-full rounded-lg border border-(--color-border)',
				'bg-(--color-surface-2) px-4 py-2 text-sm text-text-primary',
				'placeholder:text-text-muted',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'transition-colors duration-(--duration-fast)',
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
