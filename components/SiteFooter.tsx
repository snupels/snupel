import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-[#17243a] py-10 text-white/70">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="font-bold text-white">강원 스포츠 패스포트</Link>
          <p className="mt-2 text-xs">도전하고, 인증하고, 강원의 스포츠를 즐겨보세요.</p>
        </div>
        <div className="flex flex-wrap gap-5 text-xs">
          <Link href="/terms/service" className="hover:text-white hover:underline">이용약관</Link>
          <Link href="/terms/privacy" className="font-bold hover:text-white hover:underline">개인정보 처리방침</Link>
          <a href="https://www.instagram.com/gangwonsportspassport/" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">공식 인스타그램</a>
        </div>
      </div>
    </footer>
  );
}
