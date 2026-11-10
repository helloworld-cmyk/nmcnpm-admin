/**
 * Helper truy cập localStorage an toàn với SSR và chế độ riêng tư.
 * - Không chạy khi chưa có window (SSR).
 * - Mọi lỗi (localStorage bị chặn, quota...) được nuốt, không ném ra ngoài.
 */

function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    /* chế độ riêng tư: localStorage không truy cập được */
    return null;
  }
}

export function getItem(key: string): string | null {
  const storage = safeLocalStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function setItem(key: string, value: string): void {
  const storage = safeLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch {
    /* chế độ riêng tư / quá hạn mức: bỏ qua */
  }
}

export function removeItem(key: string): void {
  const storage = safeLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    /* bỏ qua */
  }
}

export function getJSON<T>(key: string): T | null {
  const raw = getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJSON(key: string, value: unknown): void {
  try {
    setItem(key, JSON.stringify(value));
  } catch {
    /* JSON hóa lỗi: bỏ qua */
  }
}
