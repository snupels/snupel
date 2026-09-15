import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sportspassport.kr"),
  title: {
    default: "강원 스포츠 패스포트",
    template: "%s | 강원 스포츠 패스포트",
  },
  description: "강원 스포츠를 탐색하고 미션에 참여해 나만의 스포츠 패스포트를 완성하세요.",
  applicationName: "강원 스포츠 패스포트",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "강원 스포츠 패스포트",
    title: "강원 스포츠 패스포트",
    description: "강원 스포츠를 탐색하고 미션에 참여해 나만의 스포츠 패스포트를 완성하세요.",
  },
  twitter: {
    card: "summary",
    title: "강원 스포츠 패스포트",
    description: "강원 스포츠를 탐색하고 미션에 참여해 나만의 스포츠 패스포트를 완성하세요.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
