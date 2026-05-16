import { cn } from '@/lib/cn';

const REVIEWS = [
	{ text: 'Cleaned 847 newsletters in 2 minutes', stars: 5 },
	{ text: 'Finally killed LinkedIn notifications', stars: 5 },
	{ text: 'Worth every penny at $6/month', stars: 5 },
	{ text: 'One digest instead of 23 emails — love it', stars: 5 },
	{ text: 'Inbox zero in under 3 minutes', stars: 5 },
	{ text: 'The best $6 I spend each month', stars: 5 },
	{ text: 'Set it up, forgot about my inbox forever', stars: 5 },
	{ text: 'Unsubscribed 200 senders in one click', stars: 5 },
] as const;

function ReviewItem({ text }: { text: string }) {
	return (
		<li className="flex items-center gap-2.5 shrink-0 select-none">
			<span className="text-xs text-(--color-accent) tracking-wider" aria-hidden="true">
				★★★★★
			</span>
			<span className="text-xs text-(--color-text-muted) whitespace-nowrap">{text}</span>
		</li>
	);
}

export default function SocialProof() {
	return (
		<aside aria-label="Customer reviews" className="border-y border-(--color-border) bg-(--color-surface) py-3 overflow-hidden">
			<ul
				aria-label="Scrolling reviews"
				className="flex gap-8 w-max animate-[marquee-scroll_32s_linear_infinite]"
				style={{ willChange: 'transform' }}
			>
				{[...REVIEWS, ...REVIEWS].map((r, i) => (
					<ReviewItem key={i} text={r.text} />
				))}
			</ul>
		</aside>
	);
}
