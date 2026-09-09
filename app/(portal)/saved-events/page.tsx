import Link from "next/link";
import { SavedEventsSection } from "@/components/SavedEventsSection";

export default function SavedEventsPage() {
  return <main className="min-h-screen bg-[#f3f7f4] px-5 pb-20 pt-10 text-[#172033] sm:px-8">
    <div className="mx-auto max-w-[1180px]">
      <Link href="/mypage/" className="text-sm font-semibold text-[#637069] hover:text-[#008f45]">← 나의 패스포트로 돌아가기</Link>
      <header className="mt-8 rounded-[28px] bg-[linear-gradient(135deg,#006f3b,#009b52)] px-6 py-8 text-white sm:px-10">
        <p className="text-xs font-bold tracking-[0.18em] text-white/60">SAVED EVENTS</p>
        <h1 className="mt-2 text-3xl font-bold">행사 저장</h1>
        <p className="mt-3 text-sm text-white/80">관심 있는 행사와 축제를 따로 모아보세요.</p>
        <nav aria-label="행사와 미션" className="mt-6 flex flex-wrap gap-3"><Link href="/activity-history/" className="rounded-xl border border-white/60 px-5 py-3 text-sm font-bold hover:bg-white/10">미션 활동 보기</Link><Link href="/events/" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#00783a] hover:bg-[#e9f5ed]">이벤트·축제 둘러보기</Link></nav>
      </header>
      <SavedEventsSection />
    </div>
  </main>;
}
