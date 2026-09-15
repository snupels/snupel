import type { Metadata } from "next";
import { PasswordChangePage } from "@/components/PasswordChangePage";

export const metadata: Metadata = { title: "비밀번호 변경", description: "강원 스포츠 패스포트 계정의 비밀번호를 안전하게 변경하세요." };

export default function PasswordChange() {
  return <PasswordChangePage />;
}
