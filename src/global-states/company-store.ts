import { create } from "zustand";
import { STORAGE_KEYS } from "@/config/constants/storage";
import { getItem, removeItem, setItem } from "@/config/storage";

/**
 * Hãng xe đang được chọn để quản lý.
 * Mọi API company-scoped (/bus-companies/{companyId}/...) đọc companyId từ đây.
 */
type CompanyState = {
  companyId: string | null;
  hydrated: boolean;
  /** Đọc companyId đã lưu trong storage — gọi trong useEffect ở consumer. */
  hydrate: () => void;
  /** Đổi hãng đang quản lý và lưu vào storage. */
  setCompanyId: (companyId: string | null) => void;
  /** Xóa lựa chọn hãng (dùng khi đăng xuất). */
  clear: () => void;
};

export const useCompanyStore = create<CompanyState>((set) => ({
  companyId: null,
  hydrated: false,

  hydrate: () => {
    const companyId = getItem(STORAGE_KEYS.SELECTED_COMPANY);
    set({ companyId: companyId && companyId.length > 0 ? companyId : null, hydrated: true });
  },

  setCompanyId: (companyId) => {
    if (companyId && companyId.length > 0) {
      setItem(STORAGE_KEYS.SELECTED_COMPANY, companyId);
      set({ companyId });
      return;
    }
    removeItem(STORAGE_KEYS.SELECTED_COMPANY);
    set({ companyId: null });
  },

  clear: () => {
    removeItem(STORAGE_KEYS.SELECTED_COMPANY);
    set({ companyId: null });
  },
}));
