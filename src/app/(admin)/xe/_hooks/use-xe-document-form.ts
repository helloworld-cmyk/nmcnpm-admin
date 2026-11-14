"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { usePutVehicleDocument } from "@/api/xe/tanstack/use-put-vehicle-document";
import { useVehicleDocuments } from "@/api/xe/tanstack/use-vehicle-documents";
import { ApiError } from "@/api/types";
import type {
  VehicleDocumentResponse,
  VehicleDocumentType,
} from "@/api/xe/api/types";

import {
  docTypeLabel,
  emptyXeDocumentDrafts,
  seedXeDocumentDrafts,
  type XeDocumentDraft,
} from "../_data/documents";

type UseXeDocumentFormOptions = {
  companyId: string;
  vehicleId: string;
  onSaved: (message: string) => void;
};

/*
 * State + nghiệp vụ trình quản lý giấy tờ xe: nạp giấy tờ hiện có, sửa bản nháp
 * theo từng loại và lưu (upsert) qua PUT. Component chỉ render UI.
 */
export function useXeDocumentForm({
  companyId,
  vehicleId,
  onSaved,
}: UseXeDocumentFormOptions) {
  const queryClient = useQueryClient();
  const docsQuery = useVehicleDocuments(companyId, vehicleId, { enabled: true });
  const putDocument = usePutVehicleDocument(companyId, vehicleId);

  const [drafts, setDrafts] = useState(emptyXeDocumentDrafts);
  const [ready, setReady] = useState(false);
  const [activeType, setActiveType] =
    useState<VehicleDocumentType>("REGISTRATION");
  const [error, setError] = useState<string | null>(null);
  const seededRef = useRef(false);

  /*
   * Nạp giấy tờ đã có một lần khi truy vấn thành công. Chỉ bật `ready` sau khi
   * đã seed để không gửi payload rỗng ghi đè dữ liệu khi GET đang tải/lỗi.
   */
  useEffect(() => {
    if (seededRef.current || !docsQuery.isSuccess) return;
    seededRef.current = true;
    setDrafts(seedXeDocumentDrafts(docsQuery.data));
    setReady(true);
  }, [docsQuery.isSuccess, docsQuery.data]);

  const savedByType = useMemo(() => {
    const map: Partial<Record<VehicleDocumentType, VehicleDocumentResponse>> = {};
    (docsQuery.data ?? []).forEach((doc) => {
      map[doc.type] = doc;
    });
    return map;
  }, [docsQuery.data]);

  const patchField = useCallback(
    (type: VehicleDocumentType, field: keyof XeDocumentDraft, value: string) => {
      setDrafts((prev) => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
      setError(null);
    },
    []
  );

  const setActive = useCallback((type: VehicleDocumentType) => {
    setActiveType(type);
    setError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!ready) {
      setError(
        "Chưa tải được giấy tờ hiện có — hãy thử lại trước khi lưu để tránh ghi đè."
      );
      return;
    }
    const draft = drafts[activeType];
    if (draft.issuedOn && draft.expiresOn && draft.issuedOn > draft.expiresOn) {
      setError("Ngày cấp không được sau ngày hết hiệu lực.");
      return;
    }
    const trim = (value: string) => value.trim();
    try {
      await putDocument.mutateAsync({
        type: activeType,
        payload: {
          documentNumber: trim(draft.documentNumber) || null,
          issuer: trim(draft.issuer) || null,
          description: trim(draft.description) || null,
          issuedOn: draft.issuedOn || null,
          expiresOn: draft.expiresOn || null,
        },
      });
      await queryClient.invalidateQueries({
        queryKey: ["company-vehicle-documents", companyId, vehicleId],
      });
      onSaved(`Đã lưu ${docTypeLabel(activeType).toLowerCase()}.`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Có lỗi xảy ra, vui lòng thử lại."
      );
    }
  }, [
    ready,
    drafts,
    activeType,
    putDocument,
    queryClient,
    companyId,
    vehicleId,
    onSaved,
  ]);

  return {
    drafts,
    activeType,
    savedByType,
    error,
    ready,
    loadError: docsQuery.isError,
    saving: putDocument.isPending,
    refetch: docsQuery.refetch,
    patchField,
    setActive,
    submit,
  };
}
