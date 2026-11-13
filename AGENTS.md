# AGENTS.MD — Vi Vu Việt Admin (nmcnpm-admin)

Dự án: **FE quản trị (admin)** của nền tảng đặt xe ghép liên tỉnh Vi Vu Việt.
FE là Next.js 16 (App Router) + Tailwind CSS v4. Source chính nằm trong `src/`.
Folder `design/` **chỉ là tài liệu thiết kế tham chiếu**, không phải code chính
(xem §3) — và trong repo này chỉ có `design/admin/` (kèm `design/shared/`) là
nguồn tham chiếu hợp lệ.

---

## 1. Quy tắc tổ chức CSS (BẮT BUỘC)

> Nguyên tắc: **file CSS chỉ chứa style DÙNG CHUNG.** Style riêng của một
> component thì viết ngay trong TSX của component đó bằng Tailwind.

### 1.1. Khi nào được viết ra file CSS

Chỉ khi style mang tính chung, cụ thể là **một trong hai** trường hợp:

- Style được dùng ở **nhiều component/route khác nhau** (ví dụ: `.container`,
  `.btn`, `.field`, `.icon`, `.reveal` dùng chéo shell, bảng, modal, form…).
- Style được **lặp lại ở nhiều vị trí khác nhau trong codebase**, vượt ra ngoài
  phạm vi 1 component duy nhất.

→ Khi đó viết vào `src/app/globals.css`.

### 1.2. Khi nào KHÔNG được viết ra file CSS riêng

- Style **chỉ dùng trong 1 component duy nhất** — kể cả component đó được
  render/tái sử dụng ở nhiều chỗ. Toàn bộ style của component đó phải nằm ngay
  trong TSX của nó (Tailwind inline).
- Style **chỉ áp dụng 1 lần cho 1 thẻ bất kỳ** — viết utility Tailwind tại chỗ
  dùng, không tạo class mới.

### 1.3. Cách viết style riêng của component

- Viết utility Tailwind trực tiếp vào `className` trong TSX.
- Nếu một chuỗi class lặp lại nhiều lần trong component → gom vào **hằng số ở
  đầu file**.
- Responsive cho style riêng của component → dùng variant Tailwind
  `max-[...]:` ngay tại chỗ, **không** tạo media-query riêng trong CSS dùng chung.

### 1.4. Style riêng của MỘT route

- Style chỉ phục vụ 1 màn/route → đặt file CSS ngay trong folder route:
  `src/app/<route>/_components/<ten>.css`, **chỉ import trong route đó**
  (tham khảo `src/app/(auth)/_components/auth.css`).
- Không bao giờ import CSS của route A từ route B — nếu cần dùng chung thì
  nâng lên `globals.css` theo §1.1.

### 1.5. Phạm vi các file CSS hiện tại

| File                                  | Phạm vi được phép chứa                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/app/globals.css`                 | `@import "tailwindcss"` + design tokens (`--*`) + reset + class dùng chéo (`container`, `icon`, `icon-sym`, `svg-sprite`, `btn*`, `field*`, `form-status`, `reveal`/`is-in`, `sr-only`, `skip-link`) + `@keyframes` (spin…) |
| `src/app/(auth)/_components/auth.css` | Style riêng màn đăng nhập — chỉ route `(auth)` được import                             |

- Class định nghĩa trong CSS mà **không còn chỗ nào dùng** phải bị xóa (dead
  code).
- Khi thêm class mới vào CSS, tự kiểm: nó có dùng chéo ≥2 component/route hay
  lặp lại ngoài phạm vi 1 component không — nếu không, viết inline Tailwind.

---

## 2. Quy ước chung

- Ngôn ngữ UI và comment: tiếng Việt.
- Tách component theo vai trò: `src/components/ui/`, `src/components/layout/`,
  `src/components/icons/`, `src/app/<route>/_components/` cho phần riêng của
  từng màn.
- Trước khi kết thúc task có sửa code FE: chạy `npm run lint` và
  `npx tsc --noEmit` để kiểm tra.
- Dự án chạy **Next.js 16** (App Router + Turbopack, bật `cacheComponents` và
  `partialPrefetching` trong `next.config.ts`):
  - Route/layout dùng **typed props sinh sẵn** (`PageProps<"/route">`,
    `LayoutProps<"/route">` — xem `src/app/layout.tsx` đang dùng
    `LayoutProps<"/">`), không tự khai báo `children: React.ReactNode`.
  - Path alias `@/*` → `src/*`; import chéo module (`@/global-states/...`,
    `@/config/...`, `@/components/...`) bằng alias, không dùng relative
    `../../` vượt quá 1 cấp.

### 2.1. Xử lý file tạm trong `temp/`

- Nếu tạo file tạm trong `temp/`: dọn dẹp chỉ **xóa từng file**, **KHÔNG** xóa
  folder `temp/` — không dùng lệnh xóa cả thư mục (ví dụ `rm -rf temp`).

---

## 3. Folder `design/` — CHỈ LÀ THIẾT KẾ, KHÔNG PHẢI CODE CHÍNH

- `design/` là bản thiết kế tham khảo (HTML/CSS/JS tĩnh + `DESIGN_RULES.MD` +
  `build.js`). Nó **không được build, không được import, không chạy trong
  production**.
- Trong repo này:
  - `design/admin/` — **nguồn tham chiếu chính**: 9 màn tĩnh
    (`tong-quan`, `admin-chuyen`, `don-dat`, `tai-xe`, `xe`, `tuyen-duong`,
    `khach-hang`, `admin-doanh-thu`, `dang-nhap` tại `index.html`),
    `components/` (`admin-shell`, `admin-sprite`), `css/` + `js/` dùng chéo
    (`admin-shell`, `modal`, `table`), và `screens/<ten-screen>/` chứa
    `css/` + `js/` + `partials/` riêng từng màn.
  - `design/shared/` — token/base/motion/sprite mà các màn admin tham chiếu
    qua `screen.json` → dùng làm tham chiếu token và hiệu ứng.
  - `design/khach-hang/`, `design/tai-xe/` — thuộc **FE khác** (khách hàng,
    tài xế), **bỏ qua hoàn toàn** trong repo này.
- Khi rà soát, audit, lint hay áp dụng quy tắc code của repo này → **bỏ qua
  toàn bộ folder `design/`**; các rule trong tài liệu này không áp dụng cho nó.
- Khi làm FE mới, chỉ lấy `design/admin/` làm **nguồn tham chiếu** về bố cục,
  token, hình ảnh; code FE thật phải viết lại theo cấu trúc `src/` và quy tắc §1.

---

## 4. Chuyển đổi HTML/CSS/JS tĩnh → React/Next.js (BẮT BUỘC)

> Nguyên tắc: khi chuyển code từ `design/admin/` (HTML tĩnh) sang React của
> Next.js, **luôn dùng cách viết hiện đại của React**. CẤM mang theo các
> pattern JS/CSS/HTML thuần mà React đã có sẵn cơ chế thay thế tốt hơn.

### 4.1. Quy tắc biến đổi bắt buộc

| HTML/CSS/JS thuần (cấm)                                        | React/Next.js hiện đại (dùng)                               |
| -------------------------------------------------------------- | ------------------------------------------------------------ |
| `document.querySelector` + gán `.value`, `.style`, `.textContent` | State (`useState`/`useReducer`) + render từ state         |
| `addEventListener('click', ...)`                               | Prop `onClick`, `onChange`, `onSubmit`… ngay trên JSX        |
| `element.classList.toggle/add/remove`                          | `className` có điều kiện (template literal hoặc mảng join)   |
| Ẩn/hiện bằng `style.display = 'none'`                          | Render có điều kiện (`{cond && ...}` / ternary trong JSX)    |
| Form đọc giá trị bằng `FormData` / `.value`                    | Controlled component: state + `value` + `onChange`           |
| Copy-paste khối HTML lặp lại (row bảng, cột KPI…)              | `.map()` + `key` duy nhất                                    |
| Biến đếm `i++` trong handler / biến cục bộ ngoài render        | State React (`setX(prev => prev + 1)`)                       |
| `<script>` inline, `onclick="..."` trong HTML                  | Handler React; không để lại thẻ `<script>` nào từ `design/`  |
| `<a href>` điều hướng nội bộ                                   | `<Link href>` từ `next/link`                                 |
| `<img src>`                                                    | `<Image>` từ `next/image` (khi ảnh đã nằm trong `public/`)   |
| setInterval/IntersectionObserver gắn trần                      | `useEffect` + cleanup (`return () => ...`)                   |
| `admin-shell.js` mở/đóng sidebar, `modal.js` mở/đóng modal     | State (`useState`) trong component shell/modal               |

### 4.2. Chuẩn JSX khi viết lại

- Thuộc tính đổi theo chuẩn React: `class` → `className`, `for` → `htmlFor`,
  các attribute kebab-case (`stroke-width`, `stroke-linecap`…) → camelCase.
- Thẻ rỗng phải self-closing (`<br />`, `<input />`, `<img />`).
- Icon SVG → **không copy nguyên khối SVG** vào page/component. Thêm `<symbol>`
  vào `src/components/icons/sprite.tsx` (sprite `AdminIconSprite` được mount 1
  lần ở layout/page) và render bằng `<Icon name="i-ten" className="..."/>` từ
  `src/components/icons/icon.tsx`.

### 4.3. Khi nào mới được chạm DOM trực tiếp

- Chỉ khi React không có cơ chế tương đương (ví dụ: đo kích thước, tích hợp
  thư viện bên thứ ba cần node DOM, focus/scroll phức tạp).
- Khi đó **chỉ dùng `useRef`** + `useEffect`, không bao giờ `querySelector` rải
  khắp file, và phải dọn dẹp (cleanup) đúng cách trong `useEffect`
  (tham khảo `timersRef` trong `login-form.tsx`).

### 4.4. Ví dụ minh họa (trước → sau)

**Trước — HTML/JS thuần (CẤM):**

```html
<div id="count">0</div>
<button onclick="increment()">+</button>
<script>
  let count = 0;
  function increment() {
    count++;
    document.getElementById("count").textContent = count;
  }
</script>
```

**Sau — React/Next.js hiện đại:**

```tsx
"use client";

import { useState } from "react";

const BASE_BUTTON = "rounded-full border px-3 py-1";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <span>{count}</span>
      <button className={BASE_BUTTON} onClick={() => setCount((prev) => prev + 1)}>
        +
      </button>
    </div>
  );
}
```

Điểm cần nhớ: state thay cho biến + DOM, `onClick` thay cho `onclick`/`addEventListener`,
render từ state thay cho gán `.textContent`, và class gom vào hằng số khi lặp lại.

---

## 5. Quản lý state — Zustand thay cho Provider (BẮT BUỘC)

> Nguyên tắc: **state dùng chung phải nằm trong Zustand store**, đặt trong
> `src/global-states/`. CẤM tạo `createContext` / Context Provider / external
> store tự viết (`useSyncExternalStore` thủ công) để chia sẻ state.

### 5.1. Khi nào dùng Zustand store, khi nào dùng state local

- State được **chia sẻ qua nhiều component/không cùng cây cha con trực tiếp**
  (session admin, bộ lọc bảng dùng chung nhiều khối, drawer/modal điều khiển từ
  nhiều nơi…) → Zustand store trong `src/global-states/`.
- State **chỉ dùng trong 1 component** (open/close cục bộ, hover, input riêng
  lẻ…) → `useState` ngay trong component, KHÔNG đưa vào store.
- Hiện `src/global-states/` chưa có store nào — store mới tạo đầu tiên phải
  theo đúng quy ước dưới đây.

### 5.2. Quy ước viết store

- 1 store/1 file: `src/global-states/<domain>-store.ts`, đặt tên hook
  `use<Domain>Store` (ví dụ: `session-store.ts` → `useSessionStore`,
  `chuyen-filters-store.ts` → `useChuyenFiltersStore`).
- Store chứa **state + actions**; action tự xử lý logic (validate, đổi giá trị,
  clear lỗi…) và component chỉ gọi, không duplicate logic ngoài store.
- Component đọc state bằng **selector từng field**
  (`useSessionStore((s) => s.name)`), không lấy nguyên object store để tránh
  re-render thừa.
- **DOM ref (`useRef` element) KHÔNG đưa vào store** — ref thuộc về component
  render nó; store chỉ cần biết kết quả qua action (ví dụ focus lỗi do
  component tự focus sau khi action trả về field lỗi).
- Logic cần `useRouter`/navigation đặt trong component (hoặc hook của page),
  store trả dữ liệu (vd. path đích) chứ không tự điều hướng.

### 5.3. Zustand + SSR/localStorage

- Giá trị khởi tạo của store phải **SSR-safe** (mặc định `null`/giá trị tĩnh),
  KHÔNG đọc `window`/`localStorage` lúc tạo store → tránh hydration mismatch.
- Đồng bộ từ localStorage qua action `hydrate()` gọi trong `useEffect` ở
  component consumer; KHÔNG dùng middleware `persist` trừ khi có yêu cầu riêng.
- Mọi truy cập `window` trong store phải bọc `typeof window === "undefined"`
  hoặc `try/catch` (chế độ riêng tư).
- Truy cập `localStorage` không viết tay trong component/store — dùng helper
  SSR-safe ở `src/config/storage/` (`getItem`, `setItem`, `removeItem`,
  `getJSON`, `setJSON`…), key phải đăng ký trong `STORAGE_KEYS`
  (`src/config/constants/storage.ts`), không hardcode chuỗi key.
- Lưu ý: `login-form.tsx` hiện đang ghi localStorage tay với key
  `"vvv.auth.admin"` (mock). Khi tách store session phải chuyển sang helper
  `src/config/storage/` + key đăng ký trong `STORAGE_KEYS`.

---

## 6. Lớp API — axios (BẮT BUỘC)

> Nguyên tắc: **mọi request ra backend đi qua `src/api/`**. CẤM gọi
> `axios`/`fetch` trực tiếp trong component, page hoặc store.

### 6.1. Kiến trúc mục tiêu

| Thành phần                     | File                              | Vai trò                                                                  |
| ------------------------------ | --------------------------------- | ------------------------------------------------------------------------ |
| Base client                    | `src/api/client/base.ts`          | `API_BASE_URL` (env `API_BASE_URL`, fallback `http://localhost:8080/api/v1`) + `CLIENT_CONFIG` |
| `AuthClient` / `NoAuthClient`  | `src/api/client/*.ts`             | 2 axios instance: có/không xác thực                                      |
| Interceptor                    | `src/api/interceptor.ts`          | Gắn Bearer token, unwrap envelope, tự refresh khi 401, bọc lỗi thành `ApiError` |
| Methods                        | `src/api/method.ts`               | `authApi` / `noAuthApi` — get/post/put/patch/delete trả thẳng `T`        |
| Hợp đồng chung                 | `src/api/types.ts`                | `APP_CODE`, `ApiEnvelope`, `ApiError`, `wrapRequest`                     |
| Endpoint                       | `src/api/<domain>/api/<endpoint>.ts` | Types `Payload`/`Response` + hàm gọi API (vd. `src/api/auth/api/login.ts`) |
| Hook TanStack                  | `src/api/<domain>/tanstack/use-*.ts` | Hook react-query bọc endpoint (vd. `src/api/auth/tanstack/use-login.ts`) |

- `src/api/` hiện **chưa tồn tại** — khi nối backend, tạo đúng cấu trúc trên
  (tham chiếu hợp đồng backend chung của dự án Vi Vu Việt).

### 6.2. Quy ước viết endpoint mới

- Mỗi domain tách 2 folder: `src/api/<domain>/api/` chứa endpoint gọi axios,
  `src/api/<domain>/tanstack/` chứa hook react-query tương ứng.
- 1 endpoint/1 file trong `src/api/<domain>/api/` (vd. `src/api/auth/api/login.ts`,
  `src/api/chuyen/api/list.ts`). Mỗi file export:
  - `type XxxPayload`, `type XxxResponse`;
  - hàm gọi API: `export function xxxAPI(payload): Promise<XxxResponse>`.
- Hook tương ứng đặt trong `src/api/<domain>/tanstack/use-<ten>.ts`
  (`"use client"`, lỗi là `ApiError`, nhận `options` để override).
- **Tên hàm gọi API phải có hậu tố `API`** (BẮT BUỘC): `login` → `loginAPI`,
  `getMe` → `getMeAPI`… Tránh trùng với tên biến/component/hook cùng tên ở tầng
  UI. Hook react-query (`use*.ts`) vẫn giữ tiền tố `use` và KHÔNG thêm hậu tố
  `API` (vd. `useLogin`, không phải `useLoginAPI`).
- Chọn client theo loại API: cần đăng nhập admin → `authApi` (tự gắn token,
  tự refresh khi 401); công khai (login, refresh) → `noAuthApi`.
- Body request phải bọc bằng `wrapRequest(payload)` → `{ wsRequest: payload }`.
- Response backend là envelope `{ code, message, wsResponse }` — interceptor đã
  unwrap, hàm endpoint khai báo kiểu chính là `wsResponse`.
- Chỉ `code === APP_CODE.SUCCESS (0)` là thành công; mọi lỗi business đã bị
  reject thành `ApiError` (có `code`, `status`). Component/store bắt `ApiError`
  để hiển thị `message`, KHÔNG đọc envelope thủ công.
- Đọc/ghi token: luôn qua `getItem`/`setItem`/`removeItem` của
  `src/config/storage` với `STORAGE_KEYS`. Không đọc `process.env.API_BASE_URL`
  ở đâu khác ngoài `src/api/client/base.ts`.
- Lưu ý trạng thái hiện tại: `login-form.tsx` vẫn chạy **luồng mock** (timer
  `setTimeout` trong component). Khi nối API thật: tách validate + status +
  loading vào store (§5), gọi hàm ở `src/api/auth/api/` + hook ở
  `src/api/auth/tanstack/`, component chỉ giữ focus lỗi (ref) và điều hướng
  (`router.push`).

### 6.3. Server state vs client state

- `@tanstack/react-query` đã cài (chưa dùng): cần tạo `QueryProvider` trong
  `src/components/providers/query-provider.tsx` bọc toàn app trước khi dùng
  hook tanstack; khi cần cache/refetch/invalidation dữ liệu server (bảng
  chuyến, đơn đặt, tài xế, xe, tuyến, khách hàng, doanh thu) → dùng hook trong
  `src/api/<domain>/tanstack/` thay vì tự viết cache trong Zustand.
- Zustand chỉ giữ client state (form, filter, UI); không duplicate dữ liệu
  server vào store nếu chỉ để hiển thị.

### 6.4. Tính năng "điểm dừng" — ĐÃ BỎ HOÀN TOÀN (KHÔNG TÁI TẠO)

- Mọi thứ liên quan đến **điểm dừng (stops / điểm đón-trả của hãng)** đã bị xóa
  khỏi dự án vì không cần thiết: domain API `src/api/diem-dung/` (list, create),
  endpoint thay điểm dừng của tuyến (`replace-route-stops` + hook tanstack),
  các type `StopResponse`/`RouteStop*`/`TripStopResponse` và trường `stops`
  trong `RouteResponse`/`TripResponse`, modal/cột "Điểm dừng" ở màn tuyến đường.
- **Tuyến đường chỉ cần: điểm đi – điểm đến, quãng đường, thời lượng, giá vé,
  trạng thái. Chuyến xe chỉ cần: lịch trình theo tuyến, không quản lý điểm
  dừng.**
- CẤM tạo lại bất kỳ API, type, UI, store hay mock nào liên quan đến điểm dừng.
  Nếu backend trả về trường `stops` thì bỏ qua, không map vào view-model và
  không hiển thị.

---

## 7. Cấu trúc thư mục dự án

```
nmcnpm-admin/
├── AGENTS.MD                  # Tài liệu quy tắc này
├── README.md
├── package.json / package-lock.json
├── tsconfig.json
├── next.config.ts             # cacheComponents + partialPrefetching + turbopack css
├── eslint.config.mjs
│
├── design/                    # ⚠️ THIẾT KẾ TĨNH THAM KHẢO — KHÔNG build/import (xem §3)
│   ├── DESIGN_RULES.MD        #   Quy tắc thiết kế gốc
│   ├── build.js               #   Script build bản tĩnh (không liên quan src/)
│   ├── admin/                 #   ✅ NGUỒN THAM CHIẾU CHÍNH của repo này
│   │   ├── *.html             #     9 màn tĩnh (bảng mapping §7.2)
│   │   ├── components/        #     admin-shell (sidebar+topbar), admin-sprite
│   │   ├── css/  js/          #     admin-shell, modal, table — dùng chéo các màn admin
│   │   └── screens/<ten-screen>/   # css/ + js/ + partials/ + screen.json riêng từng màn
│   ├── shared/                #   token/base/motion/sprite các màn admin tham chiếu
│   ├── khach-hang/            #   ⛔ FE khách hàng — bỏ qua trong repo này
│   └── tai-xe/                #   ⛔ FE tài xế — bỏ qua trong repo này
│
├── public/assets/             # logo.svg, favicon.svg… (bổ sung khi cần)
├── temp/                      # File tạm — chỉ xóa TỪNG FILE, giữ folder (xem §2.1)
│
└── src/                       # ✅ SOURCE CHÍNH (Next.js App Router + Tailwind v4)
    ├── api/                   #   Lớp API axios (sẽ tạo — xem §6)
    │   ├── client/            #     AuthClient / NoAuthClient + base config
    │   ├── auth/              #     Đăng nhập admin
    │   │   ├── api/           #       Endpoint login, refresh, logout, get-me
    │   │   └── tanstack/      #       Hook react-query (use-login…)
    │   ├── chuyen/            #     Quản lý chuyến (api/ + tanstack/)
    │   ├── don-dat/ …         #     don-dat, tai-xe, xe, tuyen-duong, khach-hang,
    │   │                      #     doanh-thu — mỗi domain (api/ + tanstack/)
    │   ├── interceptor.ts     #     Gắn token, unwrap envelope, refresh 401
    │   ├── method.ts          #     authApi / noAuthApi
    │   └── types.ts           #     APP_CODE, ApiEnvelope, ApiError, wrapRequest
    ├── config/                #   (sẽ tạo — §5.3) constants/ (STORAGE_KEYS), storage/
    ├── global-states/         #   (sẽ tạo — §5) Zustand stores <domain>-store.ts
    ├── components/
    │   ├── providers/         #   (sẽ tạo) query-provider.tsx — QueryProvider react-query
    │   ├── icons/             #   icon.tsx (Icon) + sprite.tsx (AdminIconSprite)
    │   ├── layout/            #   (sẽ tạo) admin-shell — khung sidebar + topbar dùng chung
    │   ├── ui/                #   (khi cần) modal, badge, table… dùng chéo ≥2 route
    │   └── reveal.tsx         #   Hiệu ứng reveal dùng chung
    └── app/
        ├── layout.tsx         #   Root layout (LayoutProps<"/">, font Be Vietnam Pro + Noto Sans)
        ├── globals.css        #   Tailwind + tokens + reset + class dùng chéo (xem §1.5)
        ├── favicon.ico
        ├── (auth)/            #   Đăng nhập quản trị (route group, URL "/")
        │   ├── page.tsx
        │   ├── _components/   #     auth.css, login-form.tsx
        │   └── _hooks/        #     use-login-form.ts
        ├── tong-quan/         #   Tổng quan — dashboard (_components/ + _hooks/)
        ├── chuyen/            #   Quản lý chuyến (_components/ + _hooks/ + _utils/ + _data/)
        ├── don-dat/           #   Quản lý đơn đặt (_components/)
        ├── tai-xe/            #   Quản lý tài xế (_components/ + _hooks/ + _utils/ + _data/)
        ├── xe/                #   Quản lý xe (_components/ + _hooks/ + _utils/ + _data/)
        ├── tuyen-duong/       #   Quản lý tuyến đường (_components/ + _hooks/ + _utils/ + _data/)
        ├── khach-hang/        #   Quản lý khách hàng (_components/ + _hooks/ + _utils/ + _data/)
        └── doanh-thu/         #   Doanh thu (_components/ + _hooks/ + _utils/ + _data/)
```

### 7.1. Quy ước theo cấu trúc

- Folder route `src/app/<ten-route>/` chứa `page.tsx`; code riêng của route đặt
  trong folder con bắt đầu bằng `_` (Next.js bỏ qua khi định tuyến):
  `_components/` (component riêng), `_hooks/` (hook riêng), `_utils/`
  (hàm tiện ích riêng), `_data/` (dữ liệu mock/thumbnail).
- State + nghiệp vụ của route phải nằm trong `_hooks/use-*.ts`; **không viết
  custom hook hoặc nhồi logic state vào file component** (xem §7.3).
- Route mới → tạo folder cùng cấp trong `src/app/`, lấy màn tương ứng trong
  `design/admin/screens/` làm tham chiếu bố cục (bảng §7.2).
- Component dùng chung ≥2 route → `src/components/` (phân vai theo folder trên);
  chỉ dùng 1 route → `src/app/<route>/_components/`.
- Store mới → `src/global-states/<domain>-store.ts` theo §5.
- Endpoint API mới → `src/api/<domain>/api/<endpoint>.ts` + hook tương ứng
  `src/api/<domain>/tanstack/use-*.ts` theo §6.
- Hằng số dùng chung (key storage, hằng cấu hình) → `src/config/constants/`;
  helper truy cập browser storage → `src/config/storage/` (xem §5.3).
- Icon mới → thêm `<symbol>` vào `src/components/icons/sprite.tsx`; không copy
  SVG trực tiếp vào page/component (xem §4.2).

### 7.2. Mapping màn thiết kế → route Next.js

| File tĩnh (`design/admin/`)  | Screen (`design/admin/screens/`) | Màn                     | Route Next.js (`src/app/`) |
| ---------------------------- | -------------------------------- | ----------------------- | -------------------------- |
| `index.html`                 | `dang-nhap/`                     | Đăng nhập quản trị      | `(auth)/page.tsx` (URL `/`) |
| `tong-quan.html`             | `tong-quan/`                     | Tổng quan (dashboard)   | `tong-quan/`               |
| `admin-chuyen.html`          | `admin-chuyen/`                  | Quản lý chuyến          | `chuyen/`                  |
| `don-dat.html`               | `admin-don-dat/`                 | Quản lý đơn đặt         | `don-dat/`                 |
| `tai-xe.html`                | `admin-tai-xe/`                  | Quản lý tài xế          | `tai-xe/`                  |
| `xe.html`                    | `admin-xe/`                      | Quản lý xe              | `xe/`                      |
| `tuyen-duong.html`           | `admin-tuyen-duong/`             | Quản lý tuyến đường     | `tuyen-duong/`             |
| `khach-hang.html`            | `admin-khach-hang/`              | Quản lý khách hàng      | `khach-hang/`              |
| `admin-doanh-thu.html`       | `admin-doanh-thu/`               | Doanh thu               | `doanh-thu/`               |

- Khung shell (sidebar + topbar + user) lấy từ
  `design/admin/components/admin-shell.html` → viết thành
  `src/components/layout/admin-shell.tsx` dùng chung các route đã đăng nhập.
- Đăng nhập thành công điều hướng tới `/tong-quan` (xem `REDIRECT_PATH` trong
  `login-form.tsx`).

### 7.3. Tách hook khỏi UI — `_hooks/` (BẮT BUỘC)

> Nguyên tắc: **component chỉ render UI.** Mọi state + nghiệp vụ (truy vấn API,
> lọc/sắp xếp/phân trang, validate form, handler gọi mutation, toast, focus lỗi)
> phải nằm trong custom hook ở `src/app/<route>/_hooks/`. File component
> `_components/*.tsx` không được chứa khối logic dài trộn lẫn JSX.

- **Vị trí & đặt tên**
  - Hook riêng của 1 route → `src/app/<route>/_hooks/use-<ten>.ts`; file bắt
    đầu bằng `"use client"` và export `use<Ten>`.
  - 1 hook/1 file, tên file kebab-case (`use-tai-xe-board.ts`,
    `use-xe-form.ts`...).
  - Hook dùng chung ≥2 route → `src/hooks/use-<ten>.ts` (chỉ tạo khi thực sự
    dùng chéo; không copy-paste hook giữa các route).
- **Được phép trong hook**: `useState`/`useReducer`, `useEffect`, `useMemo`,
  `useCallback`, `useRef`, hook react-query (`use*` trong
  `src/api/<domain>/tanstack/`), đọc Zustand store, logic validate, tính toán
  view-model, handler async gọi mutation + invalidate + toast.
- **Không được trong hook**: JSX/markup, import component UI, class Tailwind.
  Kiểu dữ liệu dùng chung của route đặt ở `_data/` hoặc `_utils/` — **không
  import type từ `_components/` vào `_hooks/`** (tránh phụ thuộc ngược).
- **Component sau khi tách** chỉ còn:
  - gọi đúng 1 hook nghiệp vụ (`use<Route>Board`, `use<X>Form`...);
  - render JSX + các sub-component presentational (EmptyState/ErrorState...);
  - truyền handler/ref do hook trả về.
- **Mẫu đặt tên theo vai trò**
  - Container màn (board/dashboard): `use-<route>-board.ts`
    (`use-tai-xe-board.ts`, `use-xe-board.ts`, `use-tuyen-duong-board.ts`,
    `use-khach-hang-board.ts`, `use-chuyen-board.ts`,
    `use-tong-quan-dashboard.ts`).
  - Form trong modal: `use-<x>-form.ts` (`use-chuyen-form.ts`,
    `use-xe-form.ts`, `use-tai-xe-form.ts`, `use-tuyen-duong-form.ts`).
  - Báo cáo/xuất dữ liệu: `use-doanh-thu-report.ts`, `use-doanh-thu-export.ts`.
- State dùng chung nhiều component/route vẫn đưa vào Zustand store
  `src/global-states/` theo §5; hook route chỉ đọc store, không tạo Context.
- Khi thêm/sửa màn: **tách hook trước, viết UI sau.** Nếu thấy file component
  có nhiều `useState`/`useEffect`/handler rải rác, tách phần đó ra hook mới
  thay vì tiếp tục nhồi vào component.
- **Join response từ nhiều API:** nếu một endpoint thiếu trường cần thiết,
  được phép gọi thêm endpoint khác (thường là API master dữ liệu — hãng xe,
  tài xế, xe, tuyến đường, khách hàng, điểm đến/điểm đi…) để join dữ liệu vào
  response-model tại hook. Nguyên tắc:
  - Chỉ join để bổ sung dữ liệu hiển thị, không tự ý tạo logic nghiệp vụ.
  - Ưu tiên gọi API master dùng `key` ngoại vi (vd. `id_tai_xe`, `id_xe`,
    `id_tuyen`, `id_khach_hang`, `id_hang_xe`) đã có sẵn trong response.
  - Thực hiện gọi song song (parallel) các request độc lập; nếu cần join
    danh sách → gọi 1 API list duy nhất rồi map theo tập ID, tránh gọi N
    request cho N bản ghi.
  - Map kết quả join vào view-model trong hook (hoặc `useMemo`), không sửa
    payload gốc của API đã gọi.
  - Với dữ liệu master ít thay đổi → cache trong react-query (queryKey riêng
    cho từng master) để giảm số lần gọi.
  - Khi join thất bại (lỗi HTTP, network), vẫn giữ hiển thị record với các
    trường có sẵn; chỉ để trống hoặc placeholder cho trường bị thiếu.

---

## 8. Tài khoản test local

> Chỉ dùng cho DB/backend local của dự án cá nhân này (không phải production).
> Khi cần đăng nhập để test UI, dùng tài khoản admin dưới đây.

- Email: `hello676913@gmail.com`
- Mật khẩu: `9ASUtkN@ki34s85`

---

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
