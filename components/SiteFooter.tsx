import Link from "next/link";
import { SERVICE_INFO, SUPPORT_HREF, SUPPORT_LABEL } from "@/lib/serviceInfo";

export function SiteFooter() {
  const externalSupport = SUPPORT_HREF.startsWith("http");
  return (
    <footer className="bg-[#17243a] py-12 text-white/70">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="font-bold text-white">{SERVICE_INFO.name}</Link>
          <p className="mt-3 max-w-sm text-xs leading-6">도전하고, 인증하고, 강원의 스포츠를 즐겨보세요.</p>
          <dl className="mt-5 space-y-2 text-xs"><div><dt className="inline font-bold text-white/85">운영 문의 </dt><dd className="inline">{SERVICE_INFO.operatorName}</dd></div><div><dt className="inline font-bold text-white/85">문의 채널 </dt><dd className="inline"><a href={SUPPORT_HREF} target={externalSupport ? "_blank" : undefined} rel={externalSupport ? "noopener noreferrer" : undefined} className="underline underline-offset-2 hover:text-white">{SUPPORT_LABEL}</a></dd></div></dl>
        </div>
        <nav aria-label="고객지원" className="text-xs">
          <h2 className="font-bold text-white">고객지원</h2>
          <div className="mt-4 flex flex-col items-start gap-3"><Link href="/support/" className="hover:text-white hover:underline">운영정보와 고객지원</Link><Link href="/support/#account-deletion" className="hover:text-white hover:underline">회원 탈퇴·개인정보 요청</Link><Link href="/support/#community-report" className="hover:text-white hover:underline">게시물·댓글 신고</Link></div>
        </nav>
        <nav aria-label="정책과 공식 채널" className="text-xs">
          <h2 className="font-bold text-white">정책과 공식 채널</h2>
          <div className="mt-4 flex flex-col items-start gap-3"><Link href="/terms/service/" className="hover:text-white hover:underline">이용약관</Link><Link href="/terms/privacy/" className="font-bold hover:text-white hover:underline">개인정보 처리방침</Link><a href={SERVICE_INFO.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">공식 인스타그램</a></div>
        </nav>
      </div>
    </footer>
  );
}
