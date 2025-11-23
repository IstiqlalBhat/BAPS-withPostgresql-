'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated, otherwise to dashboard
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4">BAPS</h1>
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
