import type { Metadata } from "next";
import { PortalPage } from "@/components/PortalPage";

export const metadata: Metadata = { title: "패스포트 미션", description: "강원 스포츠 미션의 참여 조건을 확인하고 사진 인증으로 스탬프에 도전하세요." };

export default function MissionsPage() {
  return <PortalPage page="missions" />;
}
