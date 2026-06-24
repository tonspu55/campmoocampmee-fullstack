import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AccountClient from '@/components/AccountClient';

export const metadata: Metadata = {
  title: 'บัญชีของฉัน',
};

export default async function AccountPage() {
  // Server-side auth gate — no client spinner/redirect flash.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect('/auth/signin?callbackUrl=/account');
  }

  return (
    <AccountClient
      initialUser={{ name: session.user.name, image: session.user.image }}
    />
  );
}
