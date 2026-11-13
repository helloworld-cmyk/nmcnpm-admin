import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Noto_Sans } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Đăng nhập quản trị — Vi Vu Việt",
  description:
    "Đăng nhập trang quản trị Vi Vu Việt để quản lý chuyến đi, tài xế và vận hành hệ thống.",
  icons: {
    icon: "/assets/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7FAFD",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${notoSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');",
          }}
        />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
