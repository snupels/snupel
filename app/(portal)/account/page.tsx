import type { Metadata } from "next";
import { AccountPage } from "@/components/AccountPage";

export const metadata: Metadata = { title: "계정 관리", description: "내 계정 정보, 공개 프로필과 개인정보 요청 경로를 관리하세요." };

export default function Account() {
  return <AccountPage />;
}
