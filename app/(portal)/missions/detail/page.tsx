import { Suspense } from "react";
import { MissionDetailPage } from "@/components/MissionDetailPage";

export default function MissionDetailRoute() {
  return <Suspense fallback={<main className="grid min-h-[65vh] place-items-center bg-[#f3f7f4]">미션을 불러오는 중...</main>}><MissionDetailPage /></Suspense>;
}
