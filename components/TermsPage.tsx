const articles = [
  ["제1조 목적", "본 약관은 강원 스포츠 패스포트가 제공하는 스포츠 정보, 스포츠 활동 및 미션, 이벤트·축제 정보, 맞춤형 콘텐츠 등 제반 서비스의 이용조건과 절차, 이용자와 운영자 간의 권리·의무 및 책임사항을 규정합니다."],
  ["제2조 용어의 정의", "서비스는 홈페이지를 통해 제공되는 스포츠 정보, 활동·미션, 이벤트·축제, 맞춤 코스, 일정 저장 등의 기능을 말합니다. 회원은 약관과 개인정보 처리에 동의하고 가입을 완료한 이용자이며, 패스포트는 회원의 스포츠 활동과 인증 이력을 기록하는 기능입니다."],
  ["제3조 약관의 효력 및 변경", "약관은 서비스 화면에 게시하고 이용자가 동의하여 가입을 완료하면 효력이 발생합니다. 관계 법령을 위반하지 않는 범위에서 변경할 수 있으며 변경 시 적용일과 변경사항을 안내합니다."],
  ["제4조 약관 외 준칙", "약관에 명시되지 않은 사항은 관계 법령, 개인정보 처리방침, 서비스별 운영정책과 일반적인 관례에 따릅니다."],
  ["제5조 회원가입", "필요한 정보를 입력하고 필수 약관에 동의하면 가입이 성립합니다. 타인 정보 도용, 허위정보 입력, 필수사항 누락, 서비스 운영 방해 또는 법령 위반 목적의 가입은 거절하거나 제한할 수 있습니다."],
  ["제6조 회원정보 및 계정 관리", "회원은 정확한 정보를 유지하고 변경 시 수정해야 하며 계정과 로그인 정보를 안전하게 관리해야 합니다. 계정 도용이나 부정사용을 인지하면 운영자에게 알려야 합니다."],
  ["제7조 서비스의 제공", "강원 지역 스포츠 활동·시설 정보, 스포츠 관광 콘텐츠와 맞춤 코스, 패스포트와 미션, 활동 인증, 행사·축제 정보, 관심 콘텐츠 및 일정 저장 등의 서비스를 제공합니다."],
  ["제8조 서비스 이용시간", "서비스는 원칙적으로 연중무휴 제공하되 점검, 장애, 유지보수 등의 사유로 일부 또는 전부가 일시 중단될 수 있습니다."],
  ["제9조 서비스의 변경 및 중단", "운영상 또는 기술상 필요한 경우 서비스를 변경하거나 중단할 수 있으며 중요한 변경과 종료는 가능한 범위에서 사전에 안내합니다."],
  ["제10조 스포츠 미션 및 인증", "회원은 미션별 기준에 따라 참여하고 사진, 위치정보 등의 방법으로 인증할 수 있습니다. 허위 사진, 타인의 활동, 시스템 조작 등 부정한 인증은 기록·스탬프·혜택이 취소될 수 있습니다."],
  ["제11조 이벤트 및 프로그램", "대회·행사·축제의 참가조건과 운영방법은 개별 안내에 따르며, 기상이나 주최기관 사정으로 일정과 내용이 변경 또는 취소될 수 있습니다."],
  ["제12조 외부정보 및 콘텐츠", "시설, 행사, 관광지와 운영시간 정보는 편의를 위해 제공되며 실제 내용과 다를 수 있으므로 방문 또는 참가 전에 해당 기관을 통해 확인하는 것을 권장합니다."],
  ["제13조 이용자의 의무", "허위정보 입력, 타인 계정 도용, 데이터 조작, 허위 인증, 시스템 비정상 접근, 개인정보 무단 수집, 저작권 침해 및 법령·공공질서 위반 행위를 금지합니다."],
  ["제14조 서비스 이용 제한", "약관이나 법령을 위반하거나 부정한 방법으로 미션·이벤트에 참여한 경우 서비스 이용을 제한하고 참여기록 또는 혜택을 취소할 수 있습니다."],
  ["제15조 회원 탈퇴", "회원은 언제든 탈퇴를 요청할 수 있습니다. 탈퇴 시 패스포트, 미션, 스탬프와 저장 일정 등의 정보가 삭제될 수 있으며 개인정보는 법령과 처리방침에 따라 처리됩니다."],
  ["제16조 개인정보 보호", "개인정보 보호법 등 관계 법령 및 강원 스포츠 패스포트 개인정보 처리방침에 따라 개인정보를 안전하게 처리합니다."],
  ["제17조 운영자의 의무", "관계 법령과 약관을 준수하고 안정적인 서비스 제공, 개인정보 보호조치와 장애 복구를 위해 노력합니다."],
  ["제18조 책임의 제한", "천재지변, 통신망·시스템 장애 등 통제하기 어려운 사유와 이용자의 귀책사유로 발생한 손해에 대한 책임은 법령이 허용하는 범위에서 제한될 수 있습니다. 스포츠 활동 전 건강상태와 안전수칙을 확인해야 합니다."],
  ["제19조 지식재산권", "서비스가 직접 제작한 콘텐츠의 권리는 강원 스포츠 패스포트 또는 권리자에게 있으며, 별도 허가 없이 영리 목적으로 복제·배포·전송할 수 없습니다."],
  ["제20조 준거법 및 분쟁해결", "대한민국 법령을 준거법으로 하며 분쟁 발생 시 원만한 해결을 위해 노력하고, 해결되지 않는 경우 관계 법령에 따른 관할법원에서 처리합니다."],
];

export function TermsPage() {
  return <div className="bg-[#f3f7f4] px-4 py-12 sm:px-6"><article className="mx-auto max-w-4xl rounded-[28px] border border-[#dfe7e1] bg-white p-6 shadow-sm sm:p-10"><p className="text-sm font-bold text-[#008f45]">GANGWON SPORTS PASSPORT</p><h1 className="mt-2 text-3xl font-bold">회원가입 동의</h1><p className="mt-4 leading-7 text-[#5f6c65]">강원 스포츠 패스포트는 강원특별자치도 내 다양한 스포츠 활동, 시설, 관광 콘텐츠, 미션 및 이벤트 정보를 제공합니다. 아래 내용을 확인하고 회원가입을 진행해 주세요.</p><section id="service" className="mt-10 scroll-mt-24"><h2 className="text-2xl font-bold">1. 이용약관</h2><div className="mt-6 space-y-6">{articles.map(([title, body]) => <section key={title}><h3 className="font-bold text-[#24342b]">{title}</h3><p className="mt-2 leading-7 text-[#5f6c65]">{body}</p></section>)}</div><p className="mt-8 rounded-xl bg-[#f3f7f4] px-4 py-3 text-sm">부칙: 본 약관은 2026년 8월 30일부터 시행합니다.</p></section><section id="privacy" className="mt-12 scroll-mt-24 border-t border-[#e5eae7] pt-10"><h2 className="text-2xl font-bold">2. 개인정보 수집·이용 동의</h2><div className="mt-5 overflow-hidden rounded-2xl border border-[#dfe5e1]"><dl className="divide-y divide-[#e5eae7] text-sm"><div className="grid gap-2 p-4 sm:grid-cols-[150px_1fr]"><dt className="font-bold">수집·이용 목적</dt><dd>회원가입 및 회원관리, 이용자 식별, 패스포트 서비스 제공, 스포츠 활동·미션·이벤트 참여와 인증 관리, 관심 콘텐츠·일정 관리, 문의 처리 및 서비스 안내</dd></div><div className="grid gap-2 p-4 sm:grid-cols-[150px_1fr]"><dt className="font-bold">수집 항목</dt><dd>이메일, 로그인 계정 정보, 닉네임, 프로필 사진, 생년월일·성별 등 가입 과정에서 이용자가 제공하는 정보</dd></div><div className="grid gap-2 p-4 sm:grid-cols-[150px_1fr]"><dt className="font-bold">자동 생성 정보</dt><dd>접속·서비스 이용기록, 미션·이벤트 참여정보, 인증내역, 스탬프, 관심 콘텐츠 및 저장 일정</dd></div><div className="grid gap-2 p-4 sm:grid-cols-[150px_1fr]"><dt className="font-bold">보유 기간</dt><dd>회원 탈퇴 시까지. 관계 법령에 따라 보존이 필요한 경우 해당 기간까지 보관</dd></div></dl></div><p className="mt-4 text-sm leading-6 text-[#5f6c65]">필수 개인정보 수집·이용 동의를 거부할 수 있으나, 동의하지 않으면 회원가입과 회원 대상 서비스 이용이 제한됩니다.</p></section><section className="mt-12 border-t border-[#e5eae7] pt-10"><h2 className="text-2xl font-bold">3. 선택적 홍보 수신 동의</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-[#f6f8f7] p-5"><h3 className="font-bold">홍보 이메일</h3><p className="mt-2 text-sm leading-6 text-[#5f6c65]">스포츠 행사·이벤트·축제, 신규 콘텐츠, 관광정보와 혜택을 이메일로 안내합니다.</p></div><div className="rounded-2xl bg-[#f6f8f7] p-5"><h3 className="font-bold">홍보 SNS</h3><p className="mt-2 text-sm leading-6 text-[#5f6c65]">SNS 메시지 또는 알림을 통해 행사, 프로그램과 프로모션 정보를 안내합니다.</p></div></div><p className="mt-4 text-sm leading-6 text-[#5f6c65]">두 동의는 선택사항이며 동의하지 않아도 기본 서비스 이용에는 제한이 없습니다. 마이페이지에서 언제든 수신 동의를 변경할 수 있습니다.</p></section></article></div>;
}

function TermsLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-[#f3f7f4] px-4 py-12 sm:px-6"><article className="mx-auto max-w-4xl rounded-[28px] border border-[#dfe7e1] bg-white p-6 shadow-sm sm:p-10"><p className="text-sm font-bold text-[#008f45]">GANGWON SPORTS PASSPORT</p><h1 className="mt-2 text-3xl font-bold">{title}</h1>{children}</article></div>;
}

export function ServiceTermsPage() {
  return <TermsLayout title="이용약관"><p className="mt-4 leading-7 text-[#5f6c65]">강원 스포츠 패스포트 서비스 이용에 필요한 조건과 권리·의무를 확인해 주세요.</p><div className="mt-8 space-y-6">{articles.map(([title, body]) => <section key={title}><h2 className="font-bold text-[#24342b]">{title}</h2><p className="mt-2 leading-7 text-[#5f6c65]">{body}</p></section>)}</div><p className="mt-8 rounded-xl bg-[#f3f7f4] px-4 py-3 text-sm">부칙: 본 약관은 2026년 8월 30일부터 시행합니다.</p></TermsLayout>;
}

export function PrivacyTermsPage() {
  return <TermsLayout title="개인정보 수집·이용 동의"><p className="mt-4 leading-7 text-[#5f6c65]">회원가입과 패스포트 서비스 제공을 위해 아래 개인정보를 수집·이용합니다.</p><div className="mt-8 overflow-hidden rounded-2xl border border-[#dfe5e1]"><dl className="divide-y divide-[#e5eae7] text-sm"><div className="grid gap-2 p-4 sm:grid-cols-[150px_1fr]"><dt className="font-bold">수집·이용 목적</dt><dd>회원가입 및 회원관리, 이용자 식별, 패스포트 서비스 제공, 스포츠 활동·미션·이벤트 참여와 인증 관리, 문의 처리 및 서비스 안내</dd></div><div className="grid gap-2 p-4 sm:grid-cols-[150px_1fr]"><dt className="font-bold">필수 수집 항목</dt><dd>이메일, 로그인 계정 정보, 닉네임, 프로필 사진, 전화번호</dd></div><div className="grid gap-2 p-4 sm:grid-cols-[150px_1fr]"><dt className="font-bold">선택 입력 항목</dt><dd>생년월일, 성별</dd></div><div className="grid gap-2 p-4 sm:grid-cols-[150px_1fr]"><dt className="font-bold">자동 생성 정보</dt><dd>접속·서비스 이용기록, 미션·이벤트 참여정보, 인증내역, 스탬프, 관심 콘텐츠 및 저장 일정</dd></div><div className="grid gap-2 p-4 sm:grid-cols-[150px_1fr]"><dt className="font-bold">보유 기간</dt><dd>회원 탈퇴 시까지. 관계 법령에 따라 보존이 필요한 경우 해당 기간까지 보관</dd></div></dl></div><p className="mt-5 text-sm leading-6 text-[#5f6c65]">필수 개인정보 수집·이용 동의를 거부할 수 있으나, 동의하지 않으면 회원가입과 회원 대상 서비스 이용이 제한됩니다.</p></TermsLayout>;
}
