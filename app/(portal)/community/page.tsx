import type { Metadata } from "next";
import { CommunityPage } from "@/components/CommunityPage";

export const metadata: Metadata = { title: "스포츠 피드", description: "승인된 강원 스포츠 인증 사진을 보고 좋아요, 댓글과 팔로우로 참여하세요." };

export default function Page() {
  return <CommunityPage />;
}
