Đã rà soát route `src/app/(auth)`, lớp `src/api/auth` + `src/api/client` + `src/api/interceptor.ts`, store `src/global-states/session-store.ts` (kèm `company-store.ts`), helper storage `src/config/storage` + key `src/config/constants/storage.ts`, và các call site trực tiếp phía sau đăng nhập (`src/hooks/use-session-refresh.ts`, `use-admin-access.ts`, `src/components/layout/session-gate.tsx`, `use-admin-logout.ts`). Đối chiếu backend thật ở `../ViVuViet-backend` (có tồn tại, đã đọc). `npx tsc --noEmit` và `npm run lint` đều pass (chạy lại ngày 2026-11-14), nên các vấn đề dưới đây là lỗi logic/hợp đồng API/UX, không phải lỗi type.

Phạm vi KHÔNG rà soát sâu (chỉ liên quan gián tiếp): `company-store`, `CompanyBootstrap`, các màn `(admin)`.

---

## Kết luận ngắn

**Không còn mock/`setTimeout` giả**: luồng đăng nhập đã gọi API thật (`POST /auth/login` → `GET /me` → điều hướng), token/refresh/blacklist đều đi qua interceptor. Kiến trúc (store + hook + endpoint + tanstack) theo đúng AGENTS §5–§6.

Còn tồn tại, ưu tiên cao nhất:

- **P1 — tên hiển thị luôn là email/SĐT đã gõ**, không phải tên thật, khi `/me` lỗi sau đăng nhập (và sau F5 nếu token còn hạn); không có chỗ nào refetch `/me` để sửa.
- **P1 — `/me` lỗi/`/me/companies` rỗng sau đăng nhập không chặn được người không có hãng**: admin vào được `/tong-quan` (gate báo lỗi tạm), riêng tài khoản có ROLE nhưng **không thuộc hãng ACTIVE** bị đẩy vào bẫy "không kiểm tra được quyền".
- **P1 — interceptor không chuyển về trang đăng nhập khi phiên chết** (chỉ xóa store); trang `/login` chỉ tồn tại ở URL `/`, không có middleware bảo vệ route `(admin)`.
- **P2 — `expiresIn` bị hiểu sai + lệch type** so với backend (`Long` nullable, giây), gây crash `applyTokens` trong luồng refresh.
- **P2 — token lưu localStorage, payload `/me` lưu PII vào localStorage**; lỗi backend tiếng Anh hiển thị thẳng lên form.
- **P3 — code chết/trùng**: `AUTH_REDIRECT_PATH` export không ai dùng, `REDIRECT_PATH` trùng `/tong-quan`, `FormField.required` không được truyền, icon `i-mail` cho ô "SĐT hoặc email".

---

## 1. Còn chỗ nào dùng mock/static/derived data không?

**Không có mảng dữ liệu giả, không `setTimeout` giả lập request, không `Math.random`.** Các điểm "dữ liệu không đến từ server" còn lại:

- **Tên hiển thị lấy từ ô đăng nhập**: `login({ name: identifier.trim() || "Quản trị viên" }, ...)` (`src/app/(auth)/_hooks/use-login-form.ts:127-134`). Sidebar/avatar đọc `user.name` (`src/components/layout/admin-shell.tsx:41,68-69`), nên trước khi `/me` trả về (hoặc khi `/me` lỗi) tên là email/SĐT.
- **Email tạm**: `setUser({ id: me.id, name: me.fullName, email: me.email, phone: me.phone })` (`use-login-form.ts:161-166`) nhưng `email`/`phone` nullable — nếu `email = null` thì `setJSON` ghi `undefined` và field bị **bỏ khỏi** localStorage (`src/config/storage/index.ts:57-62`, `session-store.ts:102-105`); `hydrate()` chỉ validate `name` (`session-store.ts:77-80`) nên hồ sơ thiếu field vẫn hợp lệ.
- **`user.id` lưu dạng `string`** (`session-store.ts:7`) trong khi BE trả `UUID` (`MeResponse.java:18`) — mapping hiện đúng vì BE serialize UUID thành chuỗi, nhưng là phụ thuộc ngầm vào serializer.
- **Nhãn UI tĩnh** (`StatusType` "is-info"/"is-success"/"is-error", thông báo tiếng Việt trong `get-me.ts:40-54`, `use-login-form.ts:110-114,172-175`) — hằng UI, không phải mock.

Kết luận: không có mock data; vấn đề là **derived data sai nguồn** (tên lấy từ input) — xem mục 6 P1-1.

---

## 2. Chỗ nào chưa ghép API / ghép chưa đúng?

Đã ghép đúng: `POST /auth/login` (`src/api/auth/api/login.ts:18-20`), `GET /me` (`src/api/auth/api/get-me.ts:60-62`), `POST /auth/refresh` (`refresh.ts:21-29`), `POST /auth/logout` (`logout.ts:4-6`), kèm envelope + Bearer + refresh 401 trong `src/api/interceptor.ts`.

Các điểm chưa khớp:

1. **Không refetch `/me` khi đăng nhập xong mà `/me` lỗi**: nhánh `catch` giữ hồ sơ tạm (`use-login-form.ts:167-169`). Phía `(admin)`, `useAdminAccess` chỉ gọi `/me` khi vào trang admin (`session-gate.tsx:29-32`, `use-admin-access.ts:30`), nhưng **nếu `/me` thành công ở đó thì cũng chỉ có `SessionGate` đồng bộ** (`session-gate.tsx:56-67`) — trong khi form login đã `setStatus("is-success")` và chuyển trang, một lần `/me` trong form login lỗi sẽ để tên là email **cho đến khi `SessionGate` chạy xong**; nếu `SessionGate` cũng lỗi thì tên sai tồn tại suốt phiên, kể cả sau F5 (hydrate đọc lại hồ sơ sai).
2. **`GET /me` dùng `authApi` nên khi 401 sẽ kích hoạt refresh-và-thử-lại** (`interceptor.ts:117-131`); với lần gọi trong form login (`retry: false` chỉ tắt retry của react-query, không tắt retry của interceptor) — nếu user đã đăng xuất ở tab khác, flow có thể refresh token rồi `/me` thành công, tạo phiên mới ngầm. Không sai tuyệt đối nhưng nên cân nhắc.
3. **Không kiểm tra `/me/companies` ở bước đăng nhập**: gate chỉ kiểm tra authority `COMPANY_ADMIN:<id>` từ `/me` (`get-me.ts:29-33`), không kiểm tra hãng còn `ACTIVE` (endpoint `/me/companies` mới lọc `BusCompanyStatus.ACTIVE`, xem mục 5). Kết quả: tài khoản có authority nhưng hãng INACTIVE/suspended **qua được form login** rồi bị chặn ở màn "không kiểm tra được quyền" của `SessionGate`.
4. **Không có `POST /auth/logout` ở luồng rời trang khi token chết**: interceptor chỉ `logout()` local (`interceptor.ts:89-92,137`), không gọi BE (hợp lý vì token đã chết), nhưng sau đó người dùng vẫn đứng ở trang admin cũ.

---

## 3. Còn thiếu API nào?

Đối chiếu backend (`Controller/Auth/AuthController.java:45-106` + `Controller/Trip/MeController.java`):

| Thiếu ở BE | Ảnh hưởng FE |
|---|---|
| Không có endpoint phân quyền admin rõ ràng (`POST /auth/login` không lọc loại tài khoản) | FE phải tự gọi `/me` sau login để kiểm tra `COMPANY_ADMIN` (`use-login-form.ts:144-159`), tốn 1 request thừa và có cửa sổ sai lệch. |
| Không có `roles` trong `TokenResponse` | FE phải đọc `authorities` từ `/me` ở mỗi lần vào khu admin. |
| Không có endpoint `POST /auth/login/admin` hoặc cờ `isAdmin` | Không tách được thông báo "tài khoản không phải admin". |
| `/me/companies` là endpoint **bắt buộc để chọn hãng** (`MeController.java:41-47`) nhưng kết quả gate không dùng tới | Không kiểm tra sớm "có hãng ACTIVE" trong luồng login (`use-login-form.ts:152-159`). |
| **Không có cờ phân biệt lỗi 401 do "tài khoản bị khóa/xóa" vs "sai mật khẩu" ở login** | Backend luôn trả cùng message (`AuthServiceImpl.java:94-96` → `invalidCredentials()` `:210-212`). |
| (Đã đủ) `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `GET /me` | — |

Ghi chú BE: `/me` và `/me/companies` đều `@PreAuthorize("hasAuthority('ROLE_CUSTOMER')")` (`AuthController.java:95`, `MeController.java:44`), và `JwtAuthenticationFilter` luôn cấp `ROLE_CUSTOMER` (`:73-74`) → thực tế không có endpoint "guest" nào dùng được `/me`. Điều đó đúng với FE hiện tại nhưng cần biết.

---

## 4. API có trường nào bị thiếu/lệch không?

Đối chiếu `MeResponse.java:16-31`, `TokenResponse.java:11-20`, `LoginRequest.java:12-21`, `UserAccountStatus` (`Util/Enums.java:8-13`) — type FE `MeResponse` (`get-me.ts:7-17`) và `LoginResponse` (`login.ts:10-15`) khớp tên field. Vấn đề:

| Hướng | Field/hợp đồng | Thực trạng |
|---|---|---|
| BE `Long` nullable / FE `number` | `expiresIn` (`TokenResponse.java:19`, `session-store.ts:20,41-49`) | FE coi là non-null và validate `typeof === "number"`; nếu BE đổi thành `null`, `toExpiresAt` trả `null` → `useSessionRefresh` **refresh vô hạn** ngay lần vào lần đầu (`use-session-refresh.ts:72-79`). Hiện BE luôn trả `86400` (`JwtService.java:21,101-103`). |
| Ép kiểu trả `TokenResponse` thay vì `RefreshResponse` | `refreshSessionOnce` gọi `applyTokens({ ..., expiresIn: tokens.expiresIn })` (`refresh.ts:40-46`) | Hợp lệ vì 2 type cùng shape, nhưng nếu `expiresIn` là `null/undefined` thì `expiresIn?: number \| null` nhận được; OK. |
| BE trả `authorities` thô `"<ROLE>:<companyId>"` | `get-me.ts:29-33` dò `startsWith("COMPANY_ADMIN:")` | Đúng định dạng BE (`JwtAuthenticationFilter.java:76-79` ghép `role[0] + ":" + role[1]`, repo `CompanyMemberRoleRepository.java:16-25`), nhưng **FE tin chuỗi tiền tố không validate UUID** — nếu BE đổi format (ví dụ `DRIVER:...`) sẽ âm thầm cho qua nếu tiền tố trùng. |
| FE type `createdAt: string` (`get-me.ts:15`) | BE `LocalDateTime` | Nhận được string ISO, hiện không dùng ở màn nào → dư. |
| FE type `phone/email: string \| null` | BE `String` nullable thật | Đúng. Nhưng chỗ lưu `SessionUser` dùng `email?: string \| null` + `setUser` sẽ **bỏ field khi null** (mục 1) — type không khớp hành vi lưu trữ. |
| (Thiếu ở FE) `phoneVerifiedAt` | BE `ProfileResponse.java:21` | Màn admin chưa dùng, không bắt buộc. |

Thêm: giá trị "tokenType" BE trả `"Bearer"` (`AuthServiceImpl.java:102`) nhưng FE không đọc — hardcode `Bearer ` ở `interceptor.ts:99,126`. Chấp nhận được nhưng là dead contract field.

---

## 5. File/code nào thừa, không dùng đến?

**Kiểm tra call site từng symbol trước khi kết luận chết:**

- `AUTH_REDIRECT_PATH` (`use-auth-guard.ts:8`) — **export nhưng không ai import**; `login-form.tsx:8` khai báo `REDIRECT_PATH = "/tong-quan"` trùng giá trị (`use-login-form.ts` được gọi qua `login-form.tsx:30`). → 2 hằng trùng, 1 export chết.
- `LoginStatus` (`use-login-form.ts:12`) — **export nhưng không ai import** (chỉ dùng nội bộ kiểu của `status`).
- `FormField` prop `required` (`src/components/ui/form/form-field.tsx:7,19-24,39-43`) — **call site `(auth)` không truyền** (`login-form.tsx:34-38,56-56`), dấu `*` required không hiện dù input có `required` (`login-form.tsx:52,70`). Không hẳn dead toàn cục (màn khác có thể dùng) nhưng với màn login là thiếu.
- Icon `i-mail` cho ô identifier (`login-form.tsx:44`) — ô nhận cả **SĐT hoặc email**; icon mail sai ngữ nghĩa (icon `i-phone`/`i-user` có sẵn trong `src/components/icons/`). Không phải dead code, là mismatch UI.
- `AccountStatus` (`get-me.ts:4`) trùng enum với `UserAccountStatus` (`src/api/khach-hang/api/types.ts:10`) — 2 định nghĩa cùng domain, dễ lệch; không dead nhưng nên hợp nhất thành type dùng chung.
- `noAuthApi`/`authApi` dùng đúng (`login.ts:19`, `get-me.ts:61`, `logout.ts:5`), `NoAuthClient` dùng trực tiếp ở `refresh.ts:24` (có lý do: interceptor không gắn token, tránh đệ quy) — **không thừa**.
- `src/api/auth/tanstack/use-login.ts`, `use-logout.ts`, `use-me.ts` đều có call site (`use-login-form.ts:26`, `use-admin-logout.ts:15`, `use-admin-access.ts:30`) — **không thừa**.
- `src/api/auth/api/refresh.ts` được interceptor + `use-session-refresh.ts` dùng — **không thừa**.
- `src/app/(auth)/_components/auth.css` — tất cả class `.auth`, `.auth-wrap`, `.auth-reveal`, `.auth-card`, `.auth-lead`, `.auth-form`, `.auth-submit` đều có trong `page.tsx`/`login-form.tsx` — **không thừa**.

Tóm lại: dead code là **2 export không dùng** (`AUTH_REDIRECT_PATH`, `LoginStatus`), hằng đường dẫn **trùng lặp** (`REDIRECT_PATH` vs `AUTH_REDIRECT_PATH`), và `AccountStatus` trùng enum. Không có file xóa được.

---

## 6. Các vấn đề khác, theo mức độ

### P1 — Sai nghiệp vụ / UX nghiêm trọng

1. **Tên hiển thị sai nguồn** — `login({ name: identifier.trim() ... })` (`use-login-form.ts:127-134`); sidebar đọc `user.name` (`admin-shell.tsx:68`). Khi `/me` lỗi sau login (`use-login-form.ts:167-169`) và `SessionGate` cũng lỗi (`session-gate.tsx:84-92`), sidebar/avatar hiện **email/SĐT** thay vì họ tên; tải lại trang vẫn sai vì hydrate từ localStorage (`session-store.ts:75-90`). Không có retry `/me` riêng để đồng bộ `setUser` (chỉ `SessionGate` có `onRetry` → `access.retry()`).
2. **Không chặn tài khoản không có hãng ACTIVE ngay trong form login** — form chỉ kiểm tra `accountStatus` + `COMPANY_ADMIN:` (`get-me.ts:39-57`). Tài khoản có authority nhưng hãng INACTIVE/SUSPENDED đăng nhập "thành công" rồi bị đẩy tới `AccessDenied` "Không kiểm tra được quyền truy cập" (`session-gate.tsx:84-92`) — sai ngữ cảnh (không phải lỗi mạng) và phải bấm Đăng xuất. Cần kiểm tra qua `GET /me/companies` (đã có sẵn, `get-my-companies.ts:26-28`) hoặc thêm cờ BE.
3. **Interceptor kết thúc phiên nhưng không điều hướng** — `endSession()` chỉ `logout()` + `queryClient.clear()` (`interceptor.ts:89-92`) và trả `ApiError(INVALID_TOKEN, SESSION_EXPIRED_MESSAGE, 401)` (`:138-140`); comment nói "SessionGate thấy `user === null` sẽ tự chuyển" (`:86-87`), nhưng nếu lỗi xảy ra ở một request **bất kỳ** không cùng `SessionGate`/không remount effect (`session-gate.tsx:39-54` depends on `hydrated,user`), người dùng có thể đứng lại trên trang admin với dữ liệu cũ. Ngoài ra không có `middleware.ts`: `src/app/(admin)` không bị bảo vệ ở server, mọi bảo vệ là client-side — FOUC dữ liệu shell trước khi `SessionGate` redirect (`session-gate.tsx:69-71` render `LoadingScreen`/`null`, chấp nhận được nhưng không có bảo vệ server-side).
4. **`isSubmitting` không chặn submit khi đã có success** — `status?.type === "is-success"` được tính là submitting (`use-login-form.ts:45-46`) và nút disabled (`login-form.tsx:91-93`), tốt; nhưng nếu user bấm Enter trong 700ms trước khi navigate (`SUCCESS_REDIRECT_DELAY_MS`, `use-login-form.ts:15,176-179`) thì `submitLockRef.current` đã `true` (`:120`) nên chặn — OK, không phải bug. (Ghi nhận để loại trừ.)

### P2 — Hợp đồng/security/UX

5. **`expiresIn` gap type + refresh loop** — `TokenResponse.expiresIn` là `Long` nullable ở BE (`TokenResponse.java:19`) nhưng FE `number` bắt buộc (`login.ts:14`) và `toExpiresAt` coi không phải number thì `null` (`session-store.ts:41-50`). Khi `expiresAt === null`, `useSessionRefresh` **luôn** refresh ngay (`use-session-refresh.ts:72-79`) và mỗi lần refresh lại nhận `expiresIn` null → vòng lặp refresh liên tục. Hiện chưa xảy ra vì BE luôn trả 86400, nhưng là rủi ro contract.
6. **Token + PII lưu `localStorage`** — `STORAGE_KEYS.ACCESS_TOKEN/REFRESH_TOKEN` + `AUTH_ADMIN` và `getItem` dùng `window.localStorage` (`src/config/storage/index.ts:7-15`). Refresh token sống 90 ngày ở BE (`AuthServiceImpl.java:174` `plusDays(90)`), nên XSS trên bất kỳ dependency nào = chiếm phiên dài hạn. Nên cân nhắc cookie `HttpOnly` (BE phải hỗ trợ), hoặc ít nhất không lưu `name/email/phone` trong localStorage.
7. **Thông báo lỗi backend tiếng Anh hiển thị thẳng** — `error instanceof ApiError ? error.message` (`use-login-form.ts:181-187`) đưa nguyên message BE: `"Invalid email, phone, or password"` (`AuthServiceImpl.java:210-212`), `"Authentication token is missing, invalid, or expired"` (`RestAuthenticationEntryPoint.java:37`), `"size must be..."` từ validation. Không map sang tiếng Việt; màn login đang dùng native message Việt ở `getAdminAccessDenial` (`get-me.ts:41-54`) nhưng lỗi HTTP thì không.
8. **Tham số `identifier` gửi nguyên chuỗi user gõ** — `mutateAsync({ identifier, password })` (`use-login-form.ts:126`) không trim trước khi gửi; BE tự trim (`AuthServiceImpl.java:195-199` `normalizeIdentifier`: trim + lowercase + bỏ `-() `), nên "  0912..." vẫn login được, nhưng tên hiển thị `identifier.trim()` sẽ khác input. Không lỗi nghiệp vụ, nhưng nên đồng bộ một nơi.
9. **Không có retry hiển thị lỗi khi `/me` lỗi sau login** — nhánh `catch` im lặng (`use-login-form.ts:167-169`); phiên vẫn được đưa vào `/tong-quan`, nơi `SessionGate` có thể hiện "Không kiểm tra được quyền" **thay vì** lỗi đăng nhập nào cả. Người dùng khó hiểu vì trước đó form báo "Thành công! Đang chuyển hướng..." (`use-login-form.ts:172-175`).
10. **`showPassword` không reset khi submit lỗi** — chỉ toggle tay (`use-login-form.ts:99`); sau khi mật khẩu lộ ("Hiện mật khẩu"), form lỗi vẫn để lộ. UX nhỏ nhưng nên tự ẩn lại khi submit.

### P3 — Nhỏ / a11y / code chết

11. **`FormField` không truyền `required`** → thiếu dấu `*` cho 2 trường bắt buộc (`login-form.tsx:34-38,56-56`).
12. **Icon `i-mail` cho ô "Số điện thoại hoặc email"** (`login-form.tsx:44`) — sai ngữ nghĩa.
13. **`aria-invalid={invalid.identifier}` + `invalid` cùng truyền** — `aria-invalid` nhận `boolean` nhưng React render `"false"` là attribute hợp lệ; OK. Tuy nhiên **không có `aria-describedby` trỏ tới thông báo lỗi** (`login-form.tsx:47-48,65-66`) và `FormField` không có `hint`/role; khi lỗi, screen reader chỉ nghe `aria-invalid` + `form-status` live region chung (`:96-103`). Chấp nhận được nhưng nên gắn `aria-describedby="formStatus"` khi có lỗi.
14. **Input mật khẩu autocomplete chỉ `current-password`** (`login-form.tsx:64`), identifier `autoComplete="username"` — đúng; nhưng không có `autoFocus`/không focus vào identifier khi mount (chỉ focus khi submit invalid `:115-116`) — trang login mở ra phải bấm chuột vào ô. UX nhỏ.
15. **Không có `metadata` riêng cho `(auth)`** — `src/app/layout.tsx:20-27` đặt title "Đăng nhập quản trị" cho **toàn app**, rồi `(admin)/layout.tsx:6-10` ghi đè; login dùng layout root nên đúng, nhưng tên file/route `(auth)` không có `layout.tsx` để tách. Không phải lỗi nhưng cấu trúc metadata dễ nhiễu.
16. **`login-form.tsx` truyền `className` Tailwind dài trong template literal** (`:91`) — vi phạm tinh thần AGENTS §1.3/Cách gom hằng (đã có `TOGGLE_CLASS` `:10-11` cho nút eye, nhưng nút submit chưa gom) — chưa phải lỗi.
17. **Dead export/trùng hằng** (mục 5): `AUTH_REDIRECT_PATH`, `LoginStatus`, `REDIRECT_PATH` vs `AUTH_REDIRECT_PATH`, `AccountStatus` vs `UserAccountStatus`.

---

## Thứ tự xử lý đề xuất

1. **P1**: không lưu tên giả từ identifier — chỉ lưu token ở `login()`, gọi `/me` và `setUser` trước khi báo thành công (hoặc để `SessionGate` là nguồn `name` duy nhất, `admin-shell` hiển thị skeleton khi chưa có `/me`); thêm retry `/me` khi lỗi.
2. **P1**: kiểm tra `/me/companies` (hãng ACTIVE + role COMPANY_ADMIN) trong luồng login, hoặc yêu cầu BE trả cờ `isCompanyAdmin` trong `TokenResponse`/`MeResponse` để chặn ngay tại form.
3. **P1**: khi interceptor kết thúc phiên, điều hướng về trang đăng nhập — hoặc bắt buộc có `middleware.ts`/layout effect ở `(admin)` phản ứng với `user === null`; cân nhắc gọi `router` từ hook thay vì comment "SessionGate sẽ tự chuyển".
4. **P2**: chuẩn hóa `expiresIn` (`number | null`) ở FE + dừng refresh loop khi null; map lỗi BE sang tiếng Việt; trim `identifier` trước khi gửi.
5. **P3**: dọn dead code/trùng hằng (`AUTH_REDIRECT_PATH`, `LoginStatus`, `AccountStatus`), truyền `required` cho `FormField`, đổi icon identifier, thêm `aria-describedby`, focus identifier khi mount, gom class submit thành hằng.
