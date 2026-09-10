"use client";

import Link from "next/link";
import { AppIcon, type AppIconName } from "./AppIcon";

const steps: Array<{ icon: AppIconName; title: string; text: string; href: string; action: string }> = [
  { icon: "clipboard", title: "내 여행에 맞게 고르기", text: "지역·종목·테마와 여유 시간을 선택하세요. 스탬프를 획득한 장소는 추천 후보에서 제외합니다.", href: "#course-preferences", action: "추천 조건 설정" },
  { icon: "map", title: "출발 전 동선 확인", text: "추천 결과의 전체 길찾기로 실제 자동차 경로를 확인하세요. 산길과 교통 상황에 따라 이동시간은 달라질 수 있어요.", href: "/map/", action: "강원 스포츠 지도" },
  { icon: "award", title: "여행을 스탬프로 남기기", text: "추천 장소 방문만으로 스탬프가 지급되지는 않아요. 진행 중 미션과 사진 인증 조건을 확인하고 참여하세요.", href: "/missions/", action: "참여할 미션 찾기" },
  { icon: "camera", title: "나만의 코스 후기 나누기", text: "직접 다녀온 장소와 사진을 스포츠 피드에 남겨보세요. 다른 여행자의 경험도 다음 여행의 힌트가 됩니다.", href: "/community/", action: "스포츠 피드 보기" },
];

export function CourseGuide() {
  return <section aria-labelledby="course-guide-title" className="bg-[#f3f7f4] px-4 py-12 sm:px-6">
    <div className="mx-auto max-w-[1180px]">
      <p className="text-xs font-bold tracking-widest text-[#008f45]">PLAN · EXPLORE · SHARE</p>
      <h2 id="course-guide-title" className="mt-2 text-2xl font-bold">맞춤코스, 이렇게 활용하세요</h2>
      <p className="mt-3 text-sm leading-6 text-[#627168]">추천은 여행의 시작점입니다. 장소별 운영시간·예약·장비 대여 여부는 상세정보와 공식 홈페이지에서 확인해 주세요.</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => <article key={step.title} className="flex flex-col rounded-2xl border border-[#dfe8e2] bg-white p-6">
          <div className="flex items-center justify-between"><AppIcon name={step.icon} className="size-6 text-[#008f45]" /><span className="text-xs font-bold text-[#8da395]">STEP 0{index + 1}</span></div>
          <h3 className="mt-5 font-bold">{step.title}</h3><p className="mb-6 mt-3 text-sm leading-6 text-[#627168]">{step.text}</p>
          <Link href={step.href} onClick={step.href.startsWith("#") ? () => window.dispatchEvent(new Event("sportspassport-course-settings")) : undefined} className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-[#00783a] hover:underline">{step.action}<AppIcon name="arrowRight" /></Link>
        </article>)}
      </div>
    </div>
  </section>;
}
