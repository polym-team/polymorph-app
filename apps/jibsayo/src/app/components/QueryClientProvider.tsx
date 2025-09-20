'use client';

import {
  QueryClientProvider as OriginQueryClientProvider,
  QueryClient,
} from '@tanstack/react-query';

import { useState } from 'react';

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5분
            gcTime: 1000 * 60 * 60, // 1시간
            retry: 1,
          },
        },
      })
  );

  return (
    <OriginQueryClientProvider client={queryClient}>
      {children}
    </OriginQueryClientProvider>
  );
}
