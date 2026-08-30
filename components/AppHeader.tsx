"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/service";
import { NAV_ITEMS } from "@/types";

const LOGO_PATH =
  "M6.66667 2.5L10 9.16667L14.1667 5L18.3333 17.5H1.66667L6.66667 2.5Z";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(() => api.hasToken());

  useEffect(() => {
    const refreshAuth = () => setLoggedIn(api.hasToken());
    window.addEventListener("sportspassport-auth-change", refreshAuth);
    return () => window.removeEventListener("sportspassport-auth-change", refreshAuth);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[200] h-16 border-b border-[#e5e7eb] bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.08)] backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-10 xl:px-20">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a3d] focus-visible:ring-offset-2"
          aria-label="홈으로"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#007a3d] shadow-[0_3px_8px_rgba(0,122,61,0.16)]">
            <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d={LOGO_PATH} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
          </span>
          <span className="hidden w-[156px] md:block">
            <span className="block whitespace-nowrap font-['Inter','Noto_Sans_KR',sans-serif] text-base font-semibold leading-6 text-[#007a3d]">
              강원 스포츠 패스포트
            </span>
            <span className="block whitespace-nowrap font-['Inter',sans-serif] text-[10px] font-medium leading-[15px] tracking-[0.09em] text-[#6a7282]">
              GANGWON SPORTS PASSPORT
            </span>
          </span>
        </Link>

        <nav className="app-header-nav flex h-full min-w-0 flex-1 items-center gap-4 overflow-x-auto px-1 md:justify-center lg:gap-8" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex h-full shrink-0 items-center px-0.5 font-['Inter','Noto_Sans_KR',sans-serif] text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a3d] focus-visible:ring-inset ${
                  isActive ? "text-[#007a3d]" : "text-[#364153] hover:text-[#007a3d]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
                {isActive && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-t bg-[#007a3d]" />}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Link
            href={loggedIn ? "/account" : "/login"}
            className="rounded-full border border-[#d1d5dc] bg-white px-6 py-2 font-['Inter','Noto_Sans_KR',sans-serif] text-sm font-medium leading-5 text-[#4a5565] transition-colors hover:bg-[#f3f7f4] hover:text-[#007a3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a3d] focus-visible:ring-offset-2"
          >
            {loggedIn ? "마이페이지" : "로그인"}
          </Link>
          {loggedIn && (
            <button
              type="button"
              onClick={() => {
                api.logout();
                router.push("/");
                router.refresh();
              }}
              className="rounded-full px-4 py-2 font-['Inter','Noto_Sans_KR',sans-serif] text-sm font-medium leading-5 text-[#6a7282] transition-colors hover:bg-[#f3f7f4] hover:text-[#007a3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a3d]"
            >
              로그아웃
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
