import type { AxiosRequestConfig } from "axios";

/* Địa chỉ backend; chỉ đọc biến môi trường tại đây. */
export const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://localhost:8080/api/v1";

/* Cấu hình chung cho cả client cần xác thực và client công khai. */
export const CLIENT_CONFIG: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
};