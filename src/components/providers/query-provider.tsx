"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { registerQueryClient } from "@/api/query-client-registry";

/* Cấu hình chung: lỗi nghiệp vụ (ApiError) không retry để tránh gọi lại vô ích. */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

/* Provider TanStack Query cho toàn app; QueryClient tạo trong useState để an toàn SSR. */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  /* Đăng ký để interceptor (ngoài React) xóa được cache khi phiên kết thúc. */
  useEffect(() => {
    registerQueryClient(queryClient);
    return () => registerQueryClient(null);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}