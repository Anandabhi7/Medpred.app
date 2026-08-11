'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DrugCheckerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tools?tab=drugs');
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-slate-500">
      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-sm font-medium">Redirecting to Health Tools Suite (Drug Interaction Checker)...</p>
    </div>
  );
}
