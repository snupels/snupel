import type { AppIconName } from "@/components/AppIcon";

export type BadgeDefinition = {
  id: number;
  name: string;
  description: string;
  icon: AppIconName;
};

export const BADGE_CATALOG: BadgeDefinition[] = [
  { id: 1, name: "Challenge Starter", description: "미션 첫 완료", icon: "trophy" },
  { id: 2, name: "산악 입문자", description: "첫 번째 산악 코스 인증 완료", icon: "mountain" },
  { id: 3, name: "정상 정복자", description: "해발 1,000m 이상 정상 인증", icon: "medal" },
  { id: 4, name: "트레킹 러버", description: "트레킹 코스 3회 인증 완료", icon: "activity" },
  { id: 5, name: "Wave Rider", description: "해양 스포츠 코스 인증 완료", icon: "waves" },
  { id: 6, name: "Water Adventurer", description: "내륙 수상 스포츠 코스 인증 완료", icon: "zap" },
  { id: 7, name: "Snow Rookie", description: "설상 스포츠 코스 인증 완료", icon: "snowflake" },
  { id: 8, name: "Pedal Explorer", description: "자전거 코스 인증 완료", icon: "person" },
  { id: 9, name: "Run Gangwon", description: "러닝 코스 인증 완료", icon: "flame" },
  { id: 10, name: "강원 Explorer", description: "강원도 3개 지역 방문 인증", icon: "map" },
  { id: 11, name: "선라이즈 헌터", description: "일출 명소 인증 완료", icon: "cloudSun" },
  { id: 12, name: "Multi Sports Player", description: "서로 다른 스포츠 3종 인증 완료", icon: "dumbbell" },
];

export const DEFAULT_COLLECTED_BADGE_IDS = [2, 10, 5, 4];
