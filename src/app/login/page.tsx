import { Suspense } from 'react';
import AuthPanel from '@/components/auth/AuthPanel';

export const metadata = { title: 'Sign In · Kailash Enterprises' };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-maroon-dark" />}>
      <AuthPanel mode="login" />
    </Suspense>
  );
}
