import { SERVICE_INFO, SUPPORT_HREF, SUPPORT_LABEL } from "@/lib/serviceInfo";

const externalSupport = SUPPORT_HREF.startsWith("http");

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-t border-[#e5ebe7] pt-7"><h2 className="text-xl font-bold text-[#24342b]">{title}</h2><div className="mt-3 space-y-3 text-sm leading-7 text-[#5f6c65]">{children}</div></section>;
}

export function PrivacyPolicyPage() {
  return (
    <main className="bg-[#f3f7f4] px-4 py-12 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-[28px] border border-[#dfe7e1] bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-bold text-[#008f45]">GANGWON SPORTS PASSPORT</p>
        <h1 className="mt-2 text-3xl font-bold">개인정보 처리방침</h1>
        <p className="mt-4 leading-7 text-[#5f6c65]">{SERVICE_INFO.name}은 이용자의 개인정보를 필요한 범위에서 처리하고, 관련 요청을 확인할 수 있는 절차를 제공합니다.</p>

        <div className="mt-8 space-y-8">
          <PolicySection title="1. 개인정보 처리자와 문의처">
            <dl className="overflow-hidden rounded-2xl border border-[#dfe5e1]">
              <div className="grid gap-1 p-4 sm:grid-cols-[170px_1fr]"><dt className="font-bold">운영 문의</dt><dd>{SERVICE_INFO.operatorName}</dd></div>
              {SERVICE_INFO.operatorAddress && <div className="grid gap-1 border-t border-[#e5ebe7] p-4 sm:grid-cols-[170px_1fr]"><dt className="font-bold">주소</dt><dd>{SERVICE_INFO.operatorAddress}</dd></div>}
              <div className="grid gap-1 border-t border-[#e5ebe7] p-4 sm:grid-cols-[170px_1fr]"><dt className="font-bold">개인정보 보호 담당</dt><dd>{SERVICE_INFO.privacyOfficer}</dd></div>
              <div className="grid gap-1 border-t border-[#e5ebe7] p-4 sm:grid-cols-[170px_1fr]"><dt className="font-bold">문의 채널</dt><dd><a href={SUPPORT_HREF} target={externalSupport ? "_blank" : undefined} rel={externalSupport ? "noopener noreferrer" : undefined} className="font-bold text-[#008f45] underline">{SUPPORT_LABEL}</a></dd></div>
            </dl>
          </PolicySection>

          <PolicySection title="2. 처리 목적과 개인정보 항목">
            <dl className="overflow-hidden rounded-2xl border border-[#dfe5e1]">
              <div className="grid gap-2 p-4 sm:grid-cols-[170px_1fr]"><dt className="font-bold">처리 목적</dt><dd>회원가입·계정관리, 이용자 식별, 패스포트·미션·이벤트 참여 및 인증 관리, 관심 콘텐츠·일정 관리, 문의 처리와 서비스 안내</dd></div>
              <div className="grid gap-2 border-t border-[#e5ebe7] p-4 sm:grid-cols-[170px_1fr]"><dt className="font-bold">필수 항목</dt><dd>아이디, 이메일, 로그인 계정 정보, 닉네임, 전화번호</dd></div>
              <div className="grid gap-2 border-t border-[#e5ebe7] p-4 sm:grid-cols-[170px_1fr]"><dt className="font-bold">선택 항목</dt><dd>프로필 사진, 생년월일, 성별, 주소, 마케팅 수신 동의</dd></div>
              <div className="grid gap-2 border-t border-[#e5ebe7] p-4 sm:grid-cols-[170px_1fr]"><dt className="font-bold">서비스 이용정보</dt><dd>접속·서비스 이용기록, 미션·이벤트 참여정보, 인증 사진과 인증내역, 스탬프, 댓글·좋아요·팔로우, 관심 콘텐츠와 저장 일정</dd></div>
            </dl>
          </PolicySection>

          <PolicySection title="3. 보유기간과 파기">
            <p>회원정보는 회원 탈퇴 시까지 보유합니다. 관계 법령에 따라 일정 기간 보존해야 하는 정보는 해당 기간 동안 분리 보관한 뒤 복구할 수 없는 방법으로 파기합니다.</p>
            <p>전자파일은 재생할 수 없도록 삭제하고, 출력물은 분쇄 또는 소각합니다.</p>
          </PolicySection>

          <PolicySection title="4. 제3자 제공과 처리위탁">
            <p>법적 근거가 있거나 이용자가 별도로 동의한 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다. 처리위탁 또는 제공이 발생하면 수탁자, 업무 내용, 항목과 보유기간을 이 방침에 공개합니다.</p>
            <p>행사 주최기관이나 외부 공식 사이트로 이동하는 경우 해당 서비스의 개인정보 처리방침이 적용됩니다.</p>
          </PolicySection>

          <PolicySection title="5. 이용자의 권리와 행사 방법">
            <p>이용자는 개인정보 열람, 정정, 삭제, 처리정지와 동의 철회를 요청할 수 있습니다. 계정 화면에서 직접 수정하거나 운영정보와 고객지원의 공개 문의 채널을 이용해 요청할 수 있습니다.</p>
            <p>요청 처리 전 안전한 본인확인이 필요할 수 있습니다. 비밀번호나 인증번호는 문의 메시지로 보내지 마세요.</p>
          </PolicySection>

          <PolicySection title="6. 안전성 확보조치">
            <p>접근권한 최소화, 인증정보 보호, 전송구간 보호, 접속기록 관리와 보안 업데이트 등 개인정보 보호에 필요한 기술적·관리적 조치를 적용합니다.</p>
          </PolicySection>

          <PolicySection title="7. 자동 생성 정보와 외부 서비스">
            <p>서비스 안정성과 이용현황 확인을 위해 접속기록과 브라우저 저장소를 사용할 수 있습니다. 카카오맵, Open-Meteo, Google 캘린더와 외부 공식 사이트를 이용하면 각 제공자의 정책이 적용됩니다.</p>
          </PolicySection>

          <PolicySection title="8. 처리방침 변경">
            <p>처리방침이 변경되면 적용일과 주요 변경 내용을 서비스 화면에서 안내합니다.</p>
            <p className="font-bold text-[#24342b]">시행일: {SERVICE_INFO.policyEffectiveDate}</p>
          </PolicySection>
        </div>
      </article>
    </main>
  );
}
