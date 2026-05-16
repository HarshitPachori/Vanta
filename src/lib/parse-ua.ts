export function parseUA(ua: string | null | undefined): { browser: string; os: string } {
	if (!ua) return { browser: 'Unknown browser', os: 'Unknown OS' };

	let browser = 'Unknown browser';
	if (ua.includes('Edg/')) browser = 'Edge';
	else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';
	else if (ua.includes('Chrome/')) browser = 'Chrome';
	else if (ua.includes('Firefox/')) browser = 'Firefox';
	else if (ua.includes('Safari/')) browser = 'Safari';

	let os = 'Unknown OS';
	if (ua.includes('Windows')) os = 'Windows';
	else if (ua.includes('iPhone')) os = 'iPhone';
	else if (ua.includes('iPad')) os = 'iPad';
	else if (ua.includes('Android')) os = 'Android';
	else if (ua.includes('Mac OS X')) os = 'macOS';
	else if (ua.includes('Linux')) os = 'Linux';

	return { browser, os };
}
