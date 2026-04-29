'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Provider({ children }) {
    const [qc] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 10, 
                gcTime: 1000 * 60 * 20,
                retry: 1
            }
        }
    }));

    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}