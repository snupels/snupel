import Link from "next/link";
import { AppIcon } from "./AppIcon";

export function SiteFooter() {
  return (
    <footer className="bg-[#17243a] py-10 text-white/70">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="font-bold text-white">강원 스포츠 패스포트</Link>
          <p className="mt-2 text-xs">도전하고, 인증하고, 강원의 스포츠를 즐겨보세요.</p>
        </div>
        <div className="flex flex-wrap gap-5 text-xs">
          <span className="flex items-center gap-1.5"><AppIcon name="phone" />033-000-0000</span>
          <span className="flex items-center gap-1.5"><AppIcon name="mail" />sports@gangwon.go.kr</span>
        </div>
      </div>
    </footer>
  );
}
