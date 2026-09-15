import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPage } from "@/components/LoginPage";

export const metadata: Metadata = { title: "로그인·회원가입", description: "강원 스포츠 패스포트에 로그인하거나 새 계정을 만드세요." };

export default function Login() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#f3f7f4] px-4 text-center"><div><h1 className="text-2xl font-bold">로그인·회원가입</h1><p className="mt-2 text-sm text-[#6f7a87]">계정 화면을 준비하고 있습니다…</p></div></main>}><LoginPage /></Suspense>;
}
