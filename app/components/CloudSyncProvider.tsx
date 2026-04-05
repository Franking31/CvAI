'use client';
// app/components/CloudSyncProvider.tsx

import { useCloudSync } from '@/lib/use-cloud-sync';

export default function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  useCloudSync();
  return <>{children}</>;
}