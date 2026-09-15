import type { Metadata } from "next";
import { ServiceTermsPage } from "@/components/TermsPage";

export const metadata: Metadata = { title: "이용약관", description: "강원 스포츠 패스포트 서비스의 이용조건과 권리·의무를 확인하세요." };

export default function ServiceTerms() {
  return <ServiceTermsPage />;
}
