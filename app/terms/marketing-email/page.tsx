import type { Metadata } from "next";
import { MarketingEmailTermsPage } from "@/components/TermsPage";

export const metadata: Metadata = { title: "이메일 마케팅 수신 동의", description: "이메일을 통한 행사와 혜택 안내의 이용 목적과 보유기간을 확인하세요." };

export default function MarketingEmailTerms() {
  return <MarketingEmailTermsPage />;
}
