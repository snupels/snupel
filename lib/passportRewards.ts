export type PassportRewardPlan = {
  id: string;
  phase: string;
  title: string;
  description: string;
  details: string[];
  status: "planned";
};

// These are product plans, not issued coupons or badge-shipping milestones.
// Publish eligibility thresholds only after partners and fulfillment are confirmed.
export const PASSPORT_REWARD_PLANS: PassportRewardPlan[] = [
  {
    id: "gangwon-stay",
    phase: "먼저 준비하는 혜택",
    title: "강원 숙박 할인권",
    description: "스포츠 여행을 하루 더 즐길 수 있도록, 강원 지역에서 사용할 수 있는 숙박 혜택을 준비하고 있어요.",
    details: [
      "강원 지역 숙박 제휴처에서 사용할 수 있는 할인권을 우선 준비합니다.",
      "제휴 숙소, 할인 금액, 사용 기간과 제외 날짜는 확정 후 안내합니다.",
      "현재는 할인권 발급·사용이 시작되지 않았습니다.",
    ],
    status: "planned",
  },
  {
    id: "gangwon-goods",
    phase: "다음으로 확장할 혜택",
    title: "브랜드 티셔츠 · 강원 굿즈",
    description: "강원에서 쌓은 스포츠 여정을 기념할 수 있는 자체 브랜드 티셔츠와 굿즈를 준비할 예정이에요.",
    details: [
      "강원 스포츠 패스포트만의 브랜드 티셔츠와 지역 테마 굿즈를 계획하고 있습니다.",
      "디자인, 구성, 수량, 사이즈와 수령 방법은 제작 일정에 맞춰 안내합니다.",
      "실물 배지 세트와는 별도의 패스포트 혜택입니다.",
    ],
    status: "planned",
  },
];

export const PASSPORT_REWARD_NOTICE = "패스포트 리워드는 스탬프 여정에 연결할 별도 혜택입니다. 지급 기준과 오픈 일정은 아직 확정되지 않았으며, 현재 스탬프 수가 쿠폰 발급이나 상품 수령을 보장하지 않습니다.";
