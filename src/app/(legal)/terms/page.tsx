import ReactMarkdown from 'react-markdown';
import content from '@/content/terms';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Terms of Service',
	alternates: { canonical: '/terms' },
};

export default function TermsPage() {
	return (
		<article className="legal-content">
			<ReactMarkdown>{content}</ReactMarkdown>
		</article>
	);
}
