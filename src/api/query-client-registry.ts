import type { QueryClient } from "@tanstack/react-query";

/*
 * QueryClient chỉ tồn tại trong cây React, nhưng interceptor là module thuần
 * TypeScript. Provider đăng ký client vào đây để interceptor có thể xóa cache
 * khi phiên đăng nhập kết thúc (hết hạn / refresh thất bại).
 */
let activeQueryClient: QueryClient | null = null;

export function registerQueryClient(client: QueryClient | null) {
  activeQueryClient = client;
}

export function getQueryClient(): QueryClient | null {
  return activeQueryClient;
}