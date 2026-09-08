import { type ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#f3f7f4] pt-16">
      <AppHeader />
      <a href="#page-content" className="sr-only fixed left-4 top-2 z-[300] rounded-lg bg-white p-3 text-[#007a3d] focus:not-sr-only">본문 바로가기</a>
      <div id="page-content" tabIndex={-1} className="flex-1 outline-none">{children}</div>
      <SiteFooter />
    </div>
  );
}
