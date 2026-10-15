"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "@/lib/api/service";
import { ApiError } from "@/lib/api/repository";
import { teeClaimCreateSchema, type TeeRewardResponse } from "@/lib/api/dto";

export const TEE_STATUS_LABELS = {requested: "신청 접수", preparing: "배송 준비 중", shipped: "배송 중", completed: "배송 완료"};

export function TeeRewardClaim() {
  const [reward, setReward] = useState<TeeRewardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const generation = useRef(0);
  const lock = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const version = ++generation.current;
    let active = true;
    const invalidate = () => {
      active = false; generation.current++; lock.current = false;
      formRef.current?.reset(); setEditing(false); setReward(null); setError(""); setNotice(""); setBusy(false); setLoading(true);
      setReload(value => value + 1);
    };
    window.addEventListener("sportspassport-auth-change", invalidate);
    Promise.resolve().then(async () => {
      if (!active) return;
      setLoading(true); setError("");
      try {
        const result = await api.teeReward();
        if (active && generation.current === version) setReward(result);
      } catch {
        if (active && generation.current === version) setError("신청 가능 여부를 확인하지 못했어요. 다시 확인해 주세요.");
      } finally { if (active && generation.current === version) setLoading(false); }
    });
    const requestGeneration = generation;
    return () => { active = false; requestGeneration.current++; window.removeEventListener("sportspassport-auth-change", invalidate); };
  }, [reload]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !reward?.eligible) return;
    const form = new FormData(event.currentTarget);
    const parsed = teeClaimCreateSchema.safeParse({size:form.get("size"),recipientName:form.get("recipientName"),phoneNumber:form.get("phoneNumber"),postalCode:form.get("postalCode"),address:form.get("address"),addressDetail:form.get("addressDetail"),shippingConsent:form.get("shippingConsent") === "on"});
    if (!parsed.success) { setNotice("사이즈·연락처·우편번호와 배송 정보를 확인하고 개인정보 수집·이용에 동의해 주세요."); return; }
    const version = generation.current;
    lock.current = true; setBusy(true); setNotice("");
    try {
      const claim = await api.claimTee(parsed.data);
      if (version !== generation.current) return;
      formRef.current?.reset(); setEditing(false);
      setReward(current => current ? {...current, claim, eligible:false} : null);
      setNotice("티셔츠 신청이 접수됐어요. 아래에서 신청 내역과 배송 상태를 확인할 수 있어요.");
      // Re-read the server inventory; never invent a remaining-quantity counter.
      setReload(value => value + 1);
    } catch (failure) {
      if (version !== generation.current) return;
      const code = failure instanceof ApiError && typeof failure.body === "object" && failure.body && "error" in failure.body ? String(failure.body.error) : "";
      setNotice(code === "sold_out" ? "선착순 100명 신청이 마감됐어요." : code === "not_eligible" ? "승인된 스탬프 5개를 모은 뒤 신청할 수 있어요." : code === "reward_closed" ? "현재 신청 접수가 중단되어 있어요." : failure instanceof ApiError && failure.status === 401 ? "로그인 상태를 확인한 뒤 다시 신청해 주세요." : "신청 결과를 확인하지 못했어요. ‘신청 내역 다시 확인’을 먼저 눌러 주세요. 접수됐다면 중복 신청되지 않아요.");
      if (failure instanceof ApiError && failure.status === 409) { formRef.current?.reset(); setEditing(false); setReload(value=>value+1); }
    } finally { if (version === generation.current) { lock.current = false; setBusy(false); } }
  }

  const claim = reward?.claim;
  return <section aria-label="자체 제작 티셔츠 신청" className="mt-6 border-t border-white/10 pt-5">
    {notice && <p role="status" className="mb-4 rounded-xl bg-white/10 p-4 text-sm leading-6 text-[#e6c88c]">{notice}</p>}
    {loading ? <p role="status" className="text-sm text-white/65">신청 현황 확인 중…</p> : error ? <p role="alert" className="text-sm text-red-200">{error}</p> : claim ? <div className="rounded-2xl border border-[#d5ae66]/30 bg-[#d5ae66]/10 p-5">
      <h4 className="font-bold text-[#e6c88c]">{TEE_STATUS_LABELS[claim.status]} · 접수 순번 {claim.allocationNo}번</h4>
      <dl className="mt-3 space-y-2 text-sm leading-6 text-white/75"><div><dt className="inline text-white/50">사이즈 </dt><dd className="inline">{claim.size}</dd></div><div><dt className="inline text-white/50">받는 분 </dt><dd className="inline">{claim.recipientName} · {claim.phoneNumber}</dd></div><div><dt className="inline text-white/50">배송지 </dt><dd className="inline">({claim.postalCode}) {claim.address} {claim.addressDetail}</dd></div><div><dt className="inline text-white/50">접수일 </dt><dd className="inline">{new Date(claim.requestedAt).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"})}</dd></div></dl>
      <p className="mt-3 text-xs leading-5 text-white/60">정보 수정이 필요하면 <Link href="/support/" className="underline">운영팀에 문의</Link>해 주세요. 신청·배송 과정에서 스탬프와 배지는 차감되지 않습니다.</p>
    </div> : reward && <>
      <p className="text-sm font-bold text-[#e6c88c]">남은 신청 수량 {reward.remaining} / {reward.quantity}명</p>
      <p className="mt-2 text-xs leading-6 text-white/60">승인된 스탬프 {reward.collectedStamps}개 / 기준 {reward.requiredStamps}개 · 회원당 1회, 신청 접수 완료 순입니다. 폼을 여는 것만으로 수량이 확보되지는 않아요.</p>
      {!reward.isOpen ? <p className="mt-4 text-sm text-white/65">현재 신청 접수가 중단되어 있어요.</p> : !reward.remaining ? <p className="mt-4 font-bold text-[#e6c88c]">선착순 신청 마감</p> : !reward.eligible ? <p className="mt-4 text-sm text-white/65">스탬프 {Math.max(0,reward.requiredStamps-reward.collectedStamps)}개 더 모으면 신청할 수 있어요.</p> : !editing && <button type="button" onClick={()=>{setEditing(true);setNotice("");}} className="mt-4 h-12 w-full rounded-xl bg-[#d5ae66] px-5 font-bold text-[#171d2b] hover:bg-[#e6c88c]">티셔츠 리워드 신청하기</button>}
    </>}
    {editing && reward?.eligible && <form ref={formRef} onSubmit={submit} aria-busy={busy} className="mt-5 space-y-4 rounded-2xl border border-white/15 bg-white/[0.04] p-5">
      <h4 className="font-bold">티셔츠 사이즈·배송 정보</h4>
      <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        <label className="block text-sm">사이즈<select name="size" required defaultValue="" className="mt-2 h-11 w-full rounded-xl bg-white px-3 text-[#172033]"><option value="" disabled>사이즈를 선택해 주세요</option>{["S","M","L","XL","2XL"].map(size=><option key={size}>{size}</option>)}</select></label>
        <label className="block text-sm">받는 분<input name="recipientName" required maxLength={100} autoComplete="shipping name" className="mt-2 h-11 w-full rounded-xl bg-white px-3 text-[#172033]" /></label>
        <label className="block text-sm">연락처<input name="phoneNumber" required type="tel" maxLength={30} autoComplete="shipping tel" placeholder="010-1234-5678" className="mt-2 h-11 w-full rounded-xl bg-white px-3 text-[#172033]" /></label>
        <label className="block text-sm">우편번호<input name="postalCode" required pattern="[0-9]{5}" inputMode="numeric" maxLength={5} autoComplete="shipping postal-code" className="mt-2 h-11 w-full rounded-xl bg-white px-3 text-[#172033]" /></label>
        <label className="block text-sm">기본 주소<input name="address" required minLength={5} maxLength={500} autoComplete="shipping address-line1" className="mt-2 h-11 w-full rounded-xl bg-white px-3 text-[#172033]" /></label>
        <label className="block text-sm">상세 주소 <span className="text-white/45">(해당 시 입력)</span><input name="addressDetail" maxLength={200} autoComplete="shipping address-line2" placeholder="동·호수 등 상세 배송지를 확인해 주세요" className="mt-2 h-11 w-full rounded-xl bg-white px-3 text-[#172033]" /></label>
        <details className="rounded-xl bg-white/5 p-4 text-xs leading-6 text-white/70"><summary className="font-bold">배송 개인정보 수집·이용 안내</summary><p className="mt-2">목적: 티셔츠 배송과 신청·배송 문의 처리. 항목: 수령인명, 연락처, 우편번호·주소·상세주소, 선택 사이즈와 신청·배송 상태. 보유 기간: 회원 탈퇴 시까지(법령에 따른 보관 의무가 있으면 해당 기간). 동의를 거부할 수 있으며, 거부 시 배송 신청은 불가하지만 다른 서비스 이용에는 영향이 없습니다. 배송 정보는 공개 프로필·피드에 노출되지 않습니다.</p></details>
        <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" name="shippingConsent" required className="mt-1 size-4 shrink-0 accent-[#d5ae66]" />[필수] 배송에 필요한 개인정보 수집·이용에 동의합니다.</label>
        <p className="text-xs leading-6 text-white/55">실제 상품은 디자인 시안과 세부 사양이 달라질 수 있습니다. 사이즈와 배송지를 확인한 뒤 제출해 주세요.</p>
        <div className="flex gap-2"><button type="submit" className="h-12 flex-1 rounded-xl bg-[#d5ae66] font-bold text-[#171d2b]">{busy ? "신청 중…" : "신청 완료하기"}</button><button type="button" onClick={()=>{formRef.current?.reset();setEditing(false);setNotice("");}} className="h-12 rounded-xl border border-white/20 px-4">취소</button></div>
      </fieldset>
    </form>}
    <button type="button" disabled={busy || loading} onClick={()=>setReload(value=>value+1)} className="mt-4 min-h-10 text-xs text-white/65 underline disabled:opacity-40">신청 내역 다시 확인</button>
    {reward?.canManage && <Link href="/reward-management/" className="ml-4 text-xs font-bold text-[#e6c88c] underline">운영자 신청·배송 관리</Link>}
  </section>;
}
