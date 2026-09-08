export type BadgeRewardMilestone = {
  threshold: number;
  title: string;
  description: string;
  fulfillment: string;
};

export const BADGE_REWARD_MILESTONES: BadgeRewardMilestone[] = [
  {
    threshold: 1,
    title: "디지털 배지",
    description: "배지를 달성할 때마다 획득한 디지털 배지가 즉시 지급됩니다.",
    fulfillment: "즉시 지급",
  },
  {
    threshold: 6,
    title: "실물 배지 6종 세트",
    description: "배지 6개 달성 후 실물 배지 6종 세트의 배송을 신청할 수 있습니다.",
    fulfillment: "실물 배지 배송 신청",
  },
  {
    threshold: 12,
    title: "실물 배지 12종 풀세트",
    description: "배지 12개를 모두 달성하면 실물 배지 12종 풀세트의 배송을 신청할 수 있습니다. 진행 상태는 신청 후 확인해 주세요.",
    fulfillment: "실물 배지 배송 신청",
  },
];
