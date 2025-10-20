import { ConvexProvider } from '@/lib/convex/components/convex-provider';
import { getSessionToken } from '@/lib/convex/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export async function Providers({ children }) {
  const token = await getSessionToken();

  return (
    <ConvexProvider token={token}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </ConvexProvider>
  );
}
