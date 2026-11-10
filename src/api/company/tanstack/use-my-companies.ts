"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import {
  getMyCompaniesAPI,
  type MyCompanyResponse,
} from "../api/get-my-companies";
import { ApiError } from "../../types";

type UseMyCompaniesOptions = Omit<
  UseQueryOptions<MyCompanyResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách hãng mà tài khoản đang đăng nhập là thành viên. */
export function useMyCompanies(options?: UseMyCompaniesOptions) {
  return useQuery<MyCompanyResponse[], ApiError>({
    queryKey: ["me", "companies"],
    queryFn: getMyCompaniesAPI,
    ...options,
  });
}