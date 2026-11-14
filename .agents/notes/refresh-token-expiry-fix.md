# Fix: auto logout khi refresh token hết hạn

## Root cause (đã xác nhận)
`stopRefreshing()` trong `src/api/interceptor.ts` chỉ xoá `REFRESH_TOKEN`, còn
`ACCESS_TOKEN` + user vẫn còn → `SessionGate` (`hasStoredToken()`) vẫn cho vào,
mọi query 401 nhưng **không tự đăng xuất/redirect** → kẹt màn với lỗi.

Đã đọc và xác nhận:
- `src/api/interceptor.ts:79` `stopRefreshing()` chỉ `removeItem(STORAGE_KEYS.REFRESH_TOKEN)`
- `src/global-states/session-store.ts:67` `hasStoredToken()` check `ACCESS_TOKEN`
- `src/components/layout/session-gate.tsx` chỉ redirect khi `!user || !hasStoredToken()`, không xử lý `error`
- `src/app/(protected)/layout.tsx` bọc `SessionGate` + `SessionBootstrap`

## Fix plan
1. `src/api/interceptor.ts`: thay `stopRefreshing()` bằng `endSession()` gọi
   `useSessionStore.getState().logout()` — xoá toàn bộ token + user + hãng đang chọn.
   `SessionGate` thấy `user === null` sẽ tự redirect về `/` (interceptor không có router).
   Bỏ import `removeItem` không dùng (chỉ còn `getItem` + `STORAGE_KEYS.ACCESS_TOKEN/REFRESH_TOKEN`).
   Giữ nguyên logic `refreshAccessTokenOnce` (chống race refresh).

2. `src/components/layout/session-gate.tsx`: thêm `useQueryClient()`, trong effect
   `!user` gọi `queryClient.clear()` để xoá cache `['me']` + mọi query cũ
   (tránh user cũ còn cached khi user khác đăng nhập). Giữ nguyên `router.replace('/')`.

3. Không cần sửa `hasStoredToken()` (vẫn đúng check ACCESS_TOKEN) — chỉ cần `logout()` xoá token là đủ.

4. Sau khi sửa: `npm run lint` + `npx tsc --noEmit`.

## Files to edit
- `src/api/interceptor.ts` (thay stopRefreshing -> endSession, bỏ import thừa)
- `src/components/layout/session-gate.tsx` (thêm queryClient.clear)

## Note
- `logout()` trong store đã xoá ACCESS/REFRESH/AUTH_ADMIN + clear company store (đã đọc).
- `use-logout.ts` đã có pattern removeQueries(['me']) + clearSession + router.replace — tái sử dụng.
- Không cần thêm UI "phiên hết hạn" (ngoài scope).
- `refreshAccessTokenOnce` giữ nguyên vì đã đúng chống race.
- Không thêm `error` handling vào SessionGate vì `logout()` từ interceptor đủ.
