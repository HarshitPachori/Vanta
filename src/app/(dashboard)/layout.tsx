export const dynamic = 'force-dynamic';

import DashboardShell from '@/components/dashboard/shell';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const user = await getUser();
	if (!user) redirect('/login');

	return <DashboardShell user={user}>{children}</DashboardShell>;
}
