import type { Metadata } from "next";
import { TermsPage } from "@/components/TermsPage";

export const metadata: Metadata = { title: "회원가입 동의", description: "서비스 이용약관과 개인정보 수집·이용, 선택적 마케팅 동의를 확인하세요." };

export default function Terms() {
  return <TermsPage />;
}
