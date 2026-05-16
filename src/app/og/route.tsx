import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const title = searchParams.get('title') ?? 'Cut through inbox noise.';
	const sub = searchParams.get('sub') ?? 'Scan your Gmail, kill the noise, get one clean daily digest.';

	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				backgroundColor: '#09090b',
				padding: '80px',
				fontFamily: 'system-ui, sans-serif',
				position: 'relative',
			}}
		>
			{/* Glow */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					right: 0,
					width: 600,
					height: 400,
					background: 'radial-gradient(ellipse at 80% 10%, rgba(249,115,22,0.15) 0%, transparent 65%)',
				}}
			/>

			{/* Logo row */}
			<div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
				{/* Icon — envelope + rift */}
				<svg width="56" height="56" viewBox="0 0 28 28" fill="none">
					<rect x="1" y="6" width="26" height="18" rx="3" fill="#1c1c1f" stroke="#f97316" strokeWidth="1.5" />
					<path d="M1 9.5 L12 16.5" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
					<path d="M16 16.5 L27 9.5" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
					<path d="M15.5 6 L13 13.5 L15.5 13.5 L13.5 22 L18 12.5 L15.5 12.5 L17.5 6 Z" fill="#f97316" />
				</svg>
				<div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
					<span style={{ fontSize: 36, fontWeight: 800, color: '#fafafa', letterSpacing: '-1px' }}>Inbox</span>
					<span style={{ fontSize: 36, fontWeight: 800, color: '#f97316', letterSpacing: '-1px' }}>Rift</span>
				</div>
			</div>

			{/* Title */}
			<div
				style={{
					fontSize: 64,
					fontWeight: 800,
					color: '#fafafa',
					letterSpacing: '-2px',
					lineHeight: 1.05,
					marginBottom: 24,
					maxWidth: 900,
				}}
			>
				{title}
			</div>

			{/* Sub */}
			<div style={{ fontSize: 28, color: '#71717a', maxWidth: 820, lineHeight: 1.5 }}>{sub}</div>

			{/* Bottom pills */}
			<div style={{ display: 'flex', gap: 16, marginTop: 56 }}>
				{['Gmail scan', 'Bulk unsubscribe', 'Daily digest', 'Free to start'].map((label) => (
					<div
						key={label}
						style={{
							padding: '10px 20px',
							borderRadius: 999,
							border: '1px solid #27272b',
							backgroundColor: '#111113',
							color: '#a1a1aa',
							fontSize: 18,
						}}
					>
						{label}
					</div>
				))}
			</div>
		</div>,
		{ width: 1200, height: 630 },
	);
}
