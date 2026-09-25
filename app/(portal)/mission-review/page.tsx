import type { Metadata } from "next";
import { MissionReviewPage } from "@/components/MissionReviewPage";

export const metadata: Metadata = { title: "미션 인증 관리", robots: { index: false, follow: false } };
export default function Page() { return <MissionReviewPage />; }
