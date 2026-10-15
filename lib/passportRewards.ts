export type PassportRewardPlan = {
  id: string;
  phase: string;
  title: string;
  description: string;
  details: string[];
  status: "planned" | "open";
  requiredStamps?: number;
  quantity?: number;
  previewImage?: string;
};

// These are product plans, not issued coupons or badge-shipping milestones.
// Tee applications are enforced by the backend, separately from badge shipping.
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
    phase: "우리의 여정을 입다",
    title: "자체 제작 GSP 퍼포먼스 티셔츠",
    description: "강원에서 쌓은 도전을 일상에서도. 실버톤 GSP 로고와 은은한 등고선 그래픽을 담은 자체 제작 티셔츠입니다.",
    details: [
      "스탬프 5개 달성 · 선착순 100명 대상 리워드입니다.",
      "회원당 1회, 신청 접수 완료 순으로 수량이 배정됩니다. 사이즈와 배송 정보를 입력해 신청해 주세요.",
      "승인된 스탬프만 인정되며 신청해도 스탬프와 배지는 차감되지 않습니다. 배송 진행 상태는 이 화면에서 확인할 수 있습니다.",
      "공개 이미지는 디자인 시안으로 실제 제작 시 색상과 세부 사양이 달라질 수 있습니다.",
      "실물 배지 세트와는 별도의 패스포트 혜택입니다.",
    ],
    status: "open",
    requiredStamps: 5,
    quantity: 100,
    previewImage: "/rewards/gsp-performance-tee-black.png",
  },
];

export const PASSPORT_REWARD_NOTICE = "자체 제작 티셔츠는 승인된 스탬프 5개를 달성한 회원 중 신청 접수 완료 순으로 선착순 100명에게 제공하는 리워드입니다. 회원당 1회 신청할 수 있으며 신청·수령 과정에서 스탬프와 배지는 차감되지 않습니다. 스탬프 기준 달성만으로 상품 수령이 보장되지는 않으니 신청 완료 여부를 확인해 주세요. 숙박 제휴 혜택은 아직 준비 중입니다.";
