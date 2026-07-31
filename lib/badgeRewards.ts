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
    description: "배지 6개를 달성하면 획득한 실물 배지 6종 세트를 배송합니다.",
    fulfillment: "배송",
  },
  {
    threshold: 12,
    title: "실물 배지 12종 풀세트",
    description: "배지 12개를 모두 달성하면 실물 배지 12종 풀세트를 배송합니다.",
    fulfillment: "배송",
  },
];
