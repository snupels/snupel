import type { AppIconName } from "@/components/AppIcon";

export type BadgeDefinition = {
  id: number;
  ruleKey: string;
  name: string;
  description: string;
  icon: AppIconName;
  missionAvailable?: boolean;
};

export const BADGE_CATALOG: BadgeDefinition[] = [
  { id: 1, ruleKey: "first_mission", name: "Challenge Starter", description: "미션 첫 완료", icon: "trophy" },
  { id: 2, ruleKey: "first_mountain", name: "산악 입문자", description: "산악 미션 첫 완료", icon: "mountain" },
  { id: 3, ruleKey: "summit_1000m", name: "정상 정복자", description: "해발 1,000m 이상 정상 방문 미션 완료", icon: "medal", missionAvailable: false },
  { id: 4, ruleKey: "trekking_three", name: "트레킹 러버", description: "트레킹 미션 3개 완료", icon: "activity" },
  { id: 5, ruleKey: "first_marine", name: "Wave Rider", description: "해양 스포츠 미션 완료", icon: "waves" },
  { id: 6, ruleKey: "first_inland_water", name: "Water Adventurer", description: "내륙 수상 스포츠 미션 완료", icon: "zap" },
  { id: 7, ruleKey: "first_snow", name: "Snow Rookie", description: "설상 스포츠 미션 완료", icon: "snowflake" },
  { id: 8, ruleKey: "first_cycling", name: "Pedal Explorer", description: "자전거 미션 완료", icon: "person" },
  { id: 9, ruleKey: "first_running", name: "Run Gangwon", description: "러닝 미션 완료", icon: "flame" },
  { id: 10, ruleKey: "three_missions", name: "강원 Explorer", description: "서로 다른 미션 3개 완료", icon: "map" },
  { id: 11, ruleKey: "first_sunrise", name: "선라이즈 헌터", description: "일출 명소 미션 완료", icon: "cloudSun", missionAvailable: false },
  { id: 12, ruleKey: "three_sports", name: "Multi Sports Player", description: "서로 다른 스포츠 3종 미션 완료", icon: "dumbbell" },
];

/** Database IDs can differ from display order; earned states follow the rule identity. */
export function earnedBadgeCatalogIds(badges: ReadonlyArray<{ ruleKey: string | null }>): Set<number> {
  const ids = new Set<number>();
  for (const badge of badges) {
    const ruleKey = badge.ruleKey === "three_regions" ? "three_missions" : badge.ruleKey;
    const definition = BADGE_CATALOG.find((item) => item.ruleKey === ruleKey);
    if (definition) ids.add(definition.id);
  }
  return ids;
}
