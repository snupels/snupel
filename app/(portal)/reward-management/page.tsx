import type { Metadata } from "next";
import { TeeRewardManagement } from "@/components/TeeRewardManagement";

export const metadata: Metadata = { title: "티셔츠 신청·배송 관리", robots: { index: false, follow: false } };
export default function Page() { return <TeeRewardManagement />; }
