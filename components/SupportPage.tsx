import Link from "next/link";
import { Suspense } from "react";
import { AppIcon } from "./AppIcon";
import { SupportRequestTarget } from "./SupportRequestTarget";
import { SERVICE_INFO, SUPPORT_HREF, SUPPORT_LABEL } from "@/lib/serviceInfo";

const externalSupport = SUPPORT_HREF.startsWith("http");

function SupportLink({ className = "" }: { className?: string }) {
  return <a href={SUPPORT_HREF} target={externalSupport ? "_blank" : undefined} rel={externalSupport ? "noopener noreferrer" : undefined} className={className}>{SUPPORT_LABEL}<AppIcon name="arrowRight" className="size-4" /></a>;
}

export function SupportPage() {
  return (
    <main className="min-h-screen bg-[#f3f7f4] px-4 py-12 text-[#172033] sm:px-6">
      <div className="mx-auto max-w-[980px]">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#008f45]"><AppIcon name="chevronLeft" className="size-4" />홈으로</Link>
        <header className="mt-8 rounded-[28px] bg-[#173a2d] p-7 text-white shadow-[0_24px_70px_rgba(28,72,51,0.18)] sm:p-10">
          <p className="text-sm font-bold text-[#75e5a5]">운영·지원 안내</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">운영정보와 고객지원</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">계정, 개인정보, 스포츠 피드 신고와 서비스 이용 문의 절차를 한곳에서 확인하세요.</p>
        </header>

        <section aria-labelledby="operator-title" className="mt-8 rounded-[24px] border border-[#dce5df] bg-white p-6 shadow-sm sm:p-8">
          <h2 id="operator-title" className="text-xl font-bold">서비스 운영정보</h2>
          <dl className="mt-5 divide-y divide-[#e5ebe7] text-sm">
            <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]"><dt className="font-bold">서비스명</dt><dd>{SERVICE_INFO.name}</dd></div>
            <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]"><dt className="font-bold">운영 문의</dt><dd>{SERVICE_INFO.operatorName}</dd></div>
            {SERVICE_INFO.operatorAddress && <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]"><dt className="font-bold">운영 주소</dt><dd>{SERVICE_INFO.operatorAddress}</dd></div>}
            <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]"><dt className="font-bold">공개 문의 채널</dt><dd><SupportLink className="inline-flex items-center gap-1 font-bold text-[#008f45] underline-offset-2 hover:underline" /></dd></div>
          </dl>
          {!SERVICE_INFO.supportEmail && <p className="mt-4 rounded-xl bg-[#fff7e6] px-4 py-3 text-xs leading-5 text-[#755716]">전용 고객지원 이메일이 아직 공개 설정되지 않아 공식 인스타그램 메시지를 안내합니다. 비밀번호, 인증번호, 신분증과 같은 민감정보는 메시지로 보내지 마세요.</p>}
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section id="account-deletion" className="scroll-mt-24 rounded-[24px] border border-[#dce5df] bg-white p-6 shadow-sm">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#f3efe3] text-[#78653b]"><AppIcon name="lock" className="size-5" /></span>
            <h2 className="mt-5 text-xl font-bold">회원 탈퇴·개인정보 요청</h2>
            <p className="mt-3 text-sm leading-6 text-[#66736c]">현재 온라인에서 바로 탈퇴하는 기능은 준비 중입니다. 지원 채널로 탈퇴, 열람, 정정 또는 삭제 요청을 접수해 주세요.</p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-[#59675f]"><li>가입 계정의 이메일과 요청 종류를 알려주세요.</li><li>비밀번호·인증번호는 보내지 마세요.</li><li>별도 본인확인 안내 후 처리 결과를 확인하세요.</li></ol>
            <SupportLink className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#008f45] px-5 text-sm font-bold text-white" />
          </section>

          <section id="community-report" className="scroll-mt-24 rounded-[24px] border border-[#dce5df] bg-white p-6 shadow-sm">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#e8f3ec] text-[#008f45]"><AppIcon name="messageCircle" className="size-5" /></span>
            <h2 className="mt-5 text-xl font-bold">게시물·댓글 신고</h2>
            <p className="mt-3 text-sm leading-6 text-[#66736c]">피드의 신고 링크에서 표시되는 게시물 번호 또는 댓글 번호와 신고 사유를 지원 채널에 전달해 주세요.</p>
            <Suspense><SupportRequestTarget /></Suspense>
            <p className="mt-4 rounded-xl bg-[#f6f8f7] px-4 py-3 text-xs leading-5 text-[#59675f]">긴급한 안전 문제나 불법 콘텐츠는 관련 기관에도 신고해 주세요. 신고자의 민감정보와 제3자의 개인정보를 불필요하게 첨부하지 마세요.</p>
            <SupportLink className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-[#8fc3a2] px-5 text-sm font-bold text-[#008f45]" />
          </section>
        </div>

        <section className="mt-6 rounded-[24px] border border-[#dce5df] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold">정책과 접근성</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link href="/terms/service/" className="rounded-xl border border-[#e1e7e3] p-4 text-sm font-bold hover:border-[#008f45]">이용약관</Link>
            <Link href="/terms/privacy/" className="rounded-xl border border-[#e1e7e3] p-4 text-sm font-bold hover:border-[#008f45]">개인정보 처리방침</Link>
            <a href={SERVICE_INFO.instagramUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#e1e7e3] p-4 text-sm font-bold hover:border-[#008f45]">공식 소식 채널</a>
          </div>
        </section>
      </div>
    </main>
  );
}
