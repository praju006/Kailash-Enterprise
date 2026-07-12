import { Suspense } from 'react';
import AuthPanel from '@/components/auth/AuthPanel';

export const metadata = { title: 'Create Account · Kailash Enterprises' };

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-maroon-dark" />}>
      <AuthPanel mode="register" />
    </Suspense>
  );
}
