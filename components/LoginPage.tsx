import Link from "next/link";
import { AppIcon } from "./AppIcon";
import { SiteFooter } from "./SiteFooter";

export function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
    <main className="grid flex-1 place-items-center bg-gradient-to-br from-[#e6f0e9] via-white to-[#f3f7f4] px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-white bg-white/95 p-7 shadow-[0_28px_80px_rgba(24,67,47,0.16)] sm:p-9">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3" aria-label="메인 페이지로 이동"><span className="flex size-12 items-center justify-center rounded-full bg-[#008f45] text-white"><AppIcon name="mountain" className="size-6" /></span><span><strong className="block text-[#008f45]">강원 스포츠 패스포트</strong><span className="text-[10px] tracking-[0.08em] text-[#738078]">GANGWON SPORTS PASSPORT</span></span></Link>
        <div className="mt-8 text-center"><h1 className="text-2xl font-bold">로그인</h1><p className="mt-2 text-sm text-[#6f7a87]">도장과 미션 기록을 이어서 관리하세요.</p></div>
        <form action="/" className="mt-8 space-y-5">
          <div><label htmlFor="email" className="text-sm font-semibold">이메일</label><input id="email" name="email" type="email" required placeholder="example@email.com" className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15" /></div>
          <div><div className="flex items-center justify-between"><label htmlFor="password" className="text-sm font-semibold">비밀번호</label><button type="button" className="text-xs text-[#008f45]">비밀번호 찾기</button></div><input id="password" name="password" type="password" required placeholder="비밀번호를 입력하세요" className="mt-2 h-12 w-full rounded-xl border border-[#dfe5e1] bg-[#f6f8f7] px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15" /></div>
          <button type="submit" className="h-12 w-full rounded-xl bg-[#008f45] text-sm font-semibold text-white transition hover:bg-[#00783a]">로그인</button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-[#98a19c]"><span className="h-px flex-1 bg-[#e4e9e6]" />또는<span className="h-px flex-1 bg-[#e4e9e6]" /></div>
        <div className="grid gap-3"><button type="button" className="h-11 rounded-xl border border-[#dfe5e1] text-sm font-medium hover:bg-[#f6f8f7]">Google로 로그인</button><button type="button" className="h-11 rounded-xl bg-[#fee500] text-sm font-medium text-[#191919]">카카오로 로그인</button><button type="button" className="h-11 rounded-xl bg-[#03c75a] text-sm font-medium text-white">네이버로 로그인</button></div>
        <p className="mt-7 text-center text-sm text-[#7a8491]">계정이 없으신가요? <button type="button" className="font-semibold text-[#008f45]">회원가입</button></p>
        <Link href="/" className="mt-5 flex items-center justify-center gap-1 text-sm font-semibold text-[#52605a]">로그인 없이 둘러보기<AppIcon name="arrowRight" /></Link>
      </div>
    </main>
    <SiteFooter />
    </div>
  );
}
