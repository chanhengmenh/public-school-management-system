import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROLE_REDIRECTS } from '@/lib/constants';

export default async function Home() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get('user_role')?.value;
  const accessToken = cookieStore.get('access_token')?.value;

  if (accessToken && userRole) {
    const dest = ROLE_REDIRECTS[userRole as keyof typeof ROLE_REDIRECTS];
    if (dest) redirect(dest);
  }

  redirect('/login');
}
