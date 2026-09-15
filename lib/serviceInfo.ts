const configuredSupportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
const configuredOperatorName = process.env.NEXT_PUBLIC_SERVICE_OPERATOR_NAME?.trim();
const configuredOperatorAddress = process.env.NEXT_PUBLIC_SERVICE_OPERATOR_ADDRESS?.trim();
const configuredPrivacyOfficer = process.env.NEXT_PUBLIC_PRIVACY_OFFICER?.trim();

export const SERVICE_INFO = {
  name: "강원 스포츠 패스포트",
  operatorName: configuredOperatorName || "강원 스포츠 패스포트 운영팀",
  operatorAddress: configuredOperatorAddress || "서울 관악구 관악로 1",
  privacyOfficer: configuredPrivacyOfficer || "개인정보 보호 담당자",
  supportEmail: configuredSupportEmail || "cs@sportspassport.kr",
  instagramUrl: "https://www.instagram.com/gangwonsportspassport/",
  policyEffectiveDate: "2026년 9월 15일",
} as const;

export const SUPPORT_HREF = SERVICE_INFO.supportEmail
  ? `mailto:${SERVICE_INFO.supportEmail}`
  : SERVICE_INFO.instagramUrl;

export const SUPPORT_LABEL = SERVICE_INFO.supportEmail
  ? SERVICE_INFO.supportEmail
  : "공식 인스타그램 메시지";
