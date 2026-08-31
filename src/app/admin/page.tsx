import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AdminClient from './admin-client';
import type { Locale } from '@/lib/translations';

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ secret?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const adminSecret = process.env.ADMIN_SECRET ?? 'admin-secret';

  if (params.secret !== adminSecret) {
    redirect('/');
  }

  const cookieStore = await cookies();
  const locale = (
    cookieStore.get('find-my-car-locale')?.value === 'he' ? 'he' : 'en'
  ) as Locale;

  return <AdminClient initialLocale={locale} />;
}
